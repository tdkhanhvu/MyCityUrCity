<?php

class MySQL {
	// Private PDO object
	private $dbh;

	// Construction
	public function __construct() {
		if ($_SERVER['SERVER_NAME'] == 'localhost') {
			$this->dbh = new PDO('mysql:host=localhost;dbname=mycityurcity', 'root', '', array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8'"));
		}
		else {
			$this->dbh = new PDO('mysql:host=localhost;dbname=feedback', 'root', 'admindb', array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8'"));
		}

		$this->items = ['thread', 'comment', 'reply'];
		$this->votes = ['up', 'down'];
		$this->user_types = ['fb_id'];
	}

	/***************************************************
	 ***************************************************
	 *********************	Query 	********************
	 ***************************************************
	 ***************************************************/
	private function selectFromTable($table, $args = null, $crits = null, $limit = '') {
		$query = 'SELECT ';

		// Criteria
		if($crits == null) {
			$query .= " * from $table ";
		}
		else {
			for($i = 0; $i < count($crits) - 1; $i++) {
				$query .= $crits[$i] . ", ";
			}
			$query .= $crits[$i] . " from $table ";
		}

		// Argument
		if($args != null) {
			$query .= " WHERE ";
			for($i = 0; $i < count($args) - 1; $i++) {
				$query .= $args[$i][0] . " = :_" . $args[$i][0] . " AND ";
			}
			$query .= $args[$i][0] . " = :_" . $args[$i][0];
		}

		$query .= ' '.$limit;

		try {
			$stm = $this->dbh->prepare($query);

			// Argument Binding
			if($args != null) {
				for($i = 0; $i < count($args); $i++) {
					$stm->bindValue(':_'.$args[$i][0], $args[$i][1], PDO::PARAM_INT);
				}
			}

			$stm->execute();
			return $stm->fetchAll();
		}
		catch(PDOException $e) {
		    echo $e->getMessage();
		}

		// No result
		return null;
	}

    private function getCitizenship($country) {
        switch ($country) {
            case 'Vietnam':
                return 'Vietnamese';
            case 'UK':
                return 'British';
            default:
                return 'UFO';
        }
    }

    private function getFlag($country) {
        switch ($country) {
            case 'Vietnam':
                return 'images/flag/'.'vietnam.png';
            case 'UK':
                return 'images/flag/'.'uk.png';
            default:
                return 'images/flag/'.'UFO.png';
        }
    }

    private function getColor($country) {
        switch ($country) {
            case 'Vietnam':
                return 'red';
            case 'UK':
                return 'rgb(15, 15, 90)';
            default:
                return 'black';
        }
    }

	// Select all industries
	public function selectAllComments($start = 1, $length = 10) {
		//return $this->selectFromTable('comment');

        $start -= 1;	// For Mysql to start at $start
        $comments = $this->selectFromTable('comment', null, null, "LIMIT $start, $length");
        foreach ($comments as &$cmt) {
            // Category manipulation
            $user = $this->selectFromTable('user', [['id', $cmt['userId']]]);
            $cmt['city'] = $user[0]['city'];
            $cmt['country'] = $user[0]['country'];
            $cmt['citizenship'] = $this->getCitizenship($cmt['country']);
            $cmt['flag'] = $this->getFlag($cmt['country']);
            $cmt['color'] = $this->getColor($cmt['country']);
            $cmt['userPic'] = 'https://graph.facebook.com/'.$cmt['userId'].'/picture?type=large';
            $cmt['name'] = $user[0]['name'];
            $images = $this->selectFromTable('image', [['commentId', $cmt['id']]]);
            //if (sizeof($images) > 0)
            //    $cmt['image'] = 'uploaded_file/'.$images[0]['url'];

            if (sizeof($images) > 0) {
                $cmt['images'] = array();

                foreach ($images as $img) {
                    array_push($cmt['images'],'uploaded_file/'.$img['url']);
                }
            }
        }
        return $comments;
	}

    public function insertNewComment($userId, $userName, $country, $city, $content, $img) {
        $images = isset($img) ? json_decode($img) : null;

        $user = $this->selectFromTable('user', [['id', $userId]]);

        //user not exists, create
        if (sizeof($user) == 0)
            $this->insertIntoTable('user',
            [
                ['id', $userId],
                ['name', $userName],
                ['country', $country],
                ['city', $city]
            ]);
        else {
            if ($user[0]['name'] != $userName || $user[0]['city'] != $city
                    || $user[0]['country'] != $country)
                $this->updateTable('user', [['name', $userName],['country', $country],
                    ['city', $city]],[['id', $userId]]);
        }

        $commentId = $this->insertIntoTable('comment',
            [
                ['userId', $userId],
                ['content', $content]
            ]);

        if (isset($images)) {
            foreach ($images as &$img) {
                $this->insertIntoTable('image',
                    [
                        ['commentId', $commentId],
                        ['url', $img],
                    ]);
                $img = 'uploaded_file/'.$img;
            }
        }

        $result = array();

        $result['id'] = $commentId;
        $result['flag'] = $this->getFlag($country);
        $result['citizenship'] = $this->getCitizenship($country);
        $result['color'] = $this->getColor($country);
        $result['images'] = $images;
        return $result;
    }

	// Select all comments from a particular thread
	public function selectCommentsFromThread($id, $user_id = null, $start = 1, $length = 10) {
		$start -= 1;	// For Mysql to start at $start

		$comments = $this->selectFromTable('comment', [['thread_id', $id]], null, "LIMIT $start, $length");
		foreach ($comments as &$cmt) {
			// User information
			$user_info = $this->selectFromTable('user', [['id', $cmt['user_id']]]);
			$cmt['name'] = $user_info[0]['name'];
			$cmt['photo'] = $user_info[0]['photo'];

			// Image manipulation
			$images = $this->selectFromTable('comment_image', [['comment_id', $cmt['id']]]);
			$cmt['images'] = $images;

			// User vote up/down
			$cmt['vote'] = '';
			if ($user_id != null) {
				// Up voters
				$up_voters = $this->selectVotersFromItemID('comment', 'up', $cmt['id']);
				foreach ($up_voters as $up_voter) {
					if ($up_voter['fb_id'] == $user_id) {
						$cmt['vote'] = 'up';
						break;
					}
				}

				// Down voters
				$down_voters = $this->selectVotersFromItemID('comment', 'down', $cmt['id']);
				foreach ($down_voters as $down_voter) {
					if ($down_voter['fb_id'] == $user_id) {
						$cmt['vote'] = 'down';
						break;
					}
				}
			}

			// User spam report
			$cmt['spam_report'] = 0;
			if ($user_id != null) {
				// Spam reporters
				$spam_reporters = $this->selectSpamReporters('comment', $cmt['id'], $user_type = 'fb_id');
				foreach ($spam_reporters as $reporter) {
					if ($reporter['fb_id'] == $user_id) {
						$cmt['spam_report'] = 1;
						break;
					}
				}
			}
		}

	    return $comments;
	}

	// Select all replies from a particular comment
	public function selectRepliesFromComment($id, $user_id = null, $start = 1, $length = 10) {
		$start -= 1;	// For Mysql to start at $start

	    $replies = $this->selectFromTable('reply', [['comment_id', $id]], null, "LIMIT $start, $length");
		foreach ($replies as &$rep) {
			// User information
			$user_info = $this->selectFromTable('user', [['id', $rep['user_id']]]);
			$rep['name'] = $user_info[0]['name'];
			$rep['photo'] = $user_info[0]['photo'];

			// Image manipulation
			$images = $this->selectFromTable('reply_image', [['reply_id', $rep['id']]]);
			$rep['images'] = $images;

			// User vote up/down
			$rep['vote'] = '';
			if ($user_id != null) {
				// Up voters
				$up_voters = $this->selectVotersFromItemID('reply', 'up', $rep['id']);
				foreach ($up_voters as $up_voter) {
					if ($up_voter['fb_id'] == $user_id) {
						$rep['vote'] = 'up';
						break;
					}
				}

				// Down voters
				$down_voters = $this->selectVotersFromItemID('reply', 'down', $rep['id']);
				foreach ($down_voters as $down_voter) {
					if ($down_voter['fb_id'] == $user_id) {
						$rep['vote'] = 'down';
						break;
					}
				}
			}

			// User spam report
			$rep['spam_report'] = 0;
			if ($user_id != null) {
				// Spam reporters
				$spam_reporters = $this->selectSpamReporters('reply', $rep['id'], $user_type = 'fb_id');
				foreach ($spam_reporters as $reporter) {
					if ($reporter['fb_id'] == $user_id) {
						$rep['spam_report'] = 1;
						break;
					}
				}
			}
		}

	    return $replies;
	}

	// Select all voters up/down from Item ID
	public function selectVotersFromItemID($item_type, $vote_type, $item_id, $user_type = 'fb_id') {
		if (in_array($item_type, $this->items) && in_array($vote_type, $this->votes)) {
			$table_name = $item_type.'_'.$vote_type;
			$arg = $item_type.'_id';
			return $this->selectFromTable($table_name, [[$arg, $item_id]], [$user_type]);
		}
		return -1;
	}

	// Select spam reporters
	public function selectSpamReporters($item_type, $item_id, $user_type = 'fb_id') {
		if (in_array($item_type, $this->items)) {
			$table_name = $item_type.'_spam_reporter';
			$arg = $item_type.'_id';
			return $this->selectFromTable($table_name, [[$arg, $item_id]], [$user_type]);
		}
		return -1;
	}


	/***************************************************
	 ***************************************************
	 *********************	Insert 	********************
	 ***************************************************
	 ***************************************************/

	private function insertIntoTable($table, $args = null) {
		$query = 'INSERT INTO ' . $table . '(';

		for($i = 0; $i < count($args) - 1; $i++) {
			$query .= $args[$i][0] . ", ";
		}
		$query .= $args[$i][0] . ")";

		// Argument
		if($args != null) {
			$query .= ' VALUES(';
			for($i = 0; $i < count($args) - 1; $i++) {
				$query .= ':_' . $args[$i][0] . ", ";
			}
			$query .= ':_' . $args[$i][0] . ")";
		}

		try {
			$stm = $this->dbh->prepare($query);

			// Param Binding
			if($args != null) {
				for($i = 0; $i < count($args); $i++) {
					$stm->bindParam(':_'.$args[$i][0], $args[$i][1], PDO::PARAM_INT);
				}
			}

			$stm->execute();
			return $this->dbh->lastInsertId('id');
		}
		catch(PDOException $e) {
		    echo $e->getMessage();
		}

		// No result
		return -1;
	}

    public function getAllCategoriesForCompany($comp_id) {
        $result = $this->selectFromTable('ind_com', [['company', $comp_id]]);
        return $this->selectFromTable('category_type', [['industry', $result[0]['industry']]]);
    }

	// Insert into thread
	public function insertIntoThread($branch_id, $user_id, $text, $rate, $cat = null, $img = null) {
		$cats = isset($cat) ? json_decode($cat) : null;
		$images = isset($img) ? json_decode($img) : null;

		$thr_id = $this->insertIntoTable('thread', 
			[
				['branch_id', $branch_id],
				['user_id', $user_id],
				['text', $text],
				['rate', $rate],
				['solved', 0],
				['time', date('Y-m-d H:i:s', strtotime("5 hours"))],
				['up', 0],
				['down', 0],
				['spam_status', 0],
				['comments', 0]
			]);

		// Category manipulation
		if (isset($cats)) {
			foreach ($cats as $cat) {
				$this->insertIntoTable('category', 
					[
						['thread_id', $thr_id],
						['cat', $cat],
					]);
			}
		}

		// Image manipulation
		if (isset($images)) {
			foreach ($images as $img) {
				$this->insertIntoTable('thread_image', 
					[
						['thread_id', $thr_id],
						['image_name', $img],
					]);
			}
		}

		return $thr_id;
	}

	// Insert into comment
	public function insertIntoComment($thread_id, $user_id, $text, $img = null) {
		$images = isset($img) ? json_decode($img) : null;

		// Update comment count in thread
		$thread = $this->selectFromTable('thread', [['id',$thread_id]], ['comments']);
		if ($thread[0]['comments'] != null) {
			$count = intval($thread[0]['comments']) + 1;
		}

		$this->updateTable('thread', [['comments', $count]], [['id', $thread_id]]);

		$cmt_id = $this->insertIntoTable('comment', 
			[
				['thread_id', $thread_id],
				['user_id', $user_id],
				['text', $text],
				['time', date('Y-m-d H:i:s')],
				['up', 0],
				['down', 0],
				['spam_status', 0],
				['replies', 0]
			]
		);

		// Image manipulation
		if (isset($images)) {
			foreach ($images as $img) {
				$this->insertIntoTable('comment_image', 
					[
						['comment_id', $cmt_id],
						['image_name', $img],
					]);
			}
		}

		return $cmt_id;
	}

	// Insert into reply
	public function insertIntoReply($comment_id, $user_id, $text, $img = null) {
		$images = isset($img) ? json_decode($img) : null;

		// Update comment count in comment
		$cmt = $this->selectFromTable('comment', [['id',$comment_id]], ['replies']);
		if ($cmt[0]['replies'] != null) {
			$count = intval($cmt[0]['replies']) + 1;
		}

		$this->updateTable('comment', [['replies', $count]], [['id', $comment_id]]);

		$rep_id = $this->insertIntoTable('reply', 
			[
				['comment_id', $comment_id],
				['user_id', $user_id],
				['text', $text],
				['time', date('Y-m-d H:i:s')],
				['up', 0],
				['down', 0],
				['spam_status', 0],
			]
		);

		// Image manipulation
		if (isset($images)) {
			foreach ($images as $img) {
				$this->insertIntoTable('reply_image', 
					[
						['reply_id', $rep_id],
						['image_name', $img],
					]);
			}
		}

		return $rep_id;
	}

	// Insert vote up/down to Item ID
	public function insertVoteIntoItem($item_type, $vote_type, $item_id, $user_id, $user_type = 'fb_id') {
		if (in_array($item_type, $this->items) && in_array($vote_type, $this->votes)) {
			if ($vote_type == 'up') {
				$table_name = $item_type.'_up';
				$opp_table = $item_type.'_down';
				$opp_type = 'down';
			}
			else {
				$table_name = $item_type.'_down';
				$opp_table = $item_type.'_up';
				$opp_type = 'up';
			}

			// Check if he already voted
			$id = $this->selectFromTable($table_name, [[$item_type.'_id', $item_id], [$user_type, $user_id]]);
			if (count($id) == 0) {
				// Update the up/down count in main table
				$this->vote($item_type, $item_id, $vote_type, 'add');

				// Check if opposite type existed
				$opp_id = $this->selectFromTable($opp_table, [[$item_type.'_id', $item_id], [$user_type, $user_id]]);
				
				if (count($opp_id) > 0) {
					// Delete
					$this->deleteFromTable($opp_table, [[$item_type.'_id', $item_id], [$user_type, $user_id]]);
					$this->vote($item_type, $item_id, $opp_type, 'remove');
				}

				$arg = $item_type.'_id';
				$this->deleteFromTable($table_name, [[$item_type.'_id', $item_id], [$user_type, $user_id]]);	// Avoid duplicate
				$this->insertIntoTable($table_name, [[$arg, $item_id], [$user_type, $user_id]]);
			}
			else {
				// Reduce if already existed
				$this->vote($item_type, $item_id, $vote_type, 'remove');

				// Check if current type existed
				$curr_id = $this->selectFromTable($table_name, [[$item_type.'_id', $item_id], [$user_type, $user_id]]);
				if (count($curr_id) > 0) {
					$this->deleteFromTable($table_name, [[$item_type.'_id', $item_id], [$user_type, $user_id]]);
				}
			}
			return true;
		}
		return false;
	}


	/***************************************************
	 ***************************************************
	 *********************	Update 	********************
	 ***************************************************
	 ***************************************************/

	private function updateTable($table, $args = null, $crits = null) {
		$query = 'UPDATE ' . $table . ' SET ';

		if ($args != null) {
			for($i = 0; $i < count($args) - 1; $i++) {
				$query .= $args[$i][0] . "=?, ";
			}
			$query .= $args[$i][0] . "=? ";
		}

		// Argument
		if($crits != null) {
			$query .= ' WHERE ';
			for($i = 0; $i < count($crits) - 1; $i++) {
				$query .= $crits[$i][0] . "=? ";
			}
			$query .= $crits[$i][0] . "=?";
		}

		try {
			$stm = $this->dbh->prepare($query);

			// Param Binding
			$values = array();
			foreach ($args as $arg) {
				$values[] = $arg[1];
			}
			foreach ($crits as $crit) {
				$values[] = $crit[1];
			}

			$stm->execute($values);
			return true;
		}
		catch(PDOException $e) {
		    echo $e->getMessage();
		}

		// No result
		return false;
	}

	// Up / Down vote
	private function vote($table, $id, $type = 'up', $action = 'add') {
		$items = $this->selectFromTable($table, [['id', $id]]);
		$item = count($items) > 0 ? $items[0] : null;

		if (isset($items)) {
			$up = intval($item['up']);
			$down = intval($item['down']);

			if ($type == 'up') {
				if ($action == 'add')
					$up++;
				else
					$up--;
				$this->updateTable($table, [['up', $up]], [['id', $id]]);
				return $up;
			}
			else {
				if ($action == 'add')
					$down++;
				else
					$down--;
				$this->updateTable($table, [['down', $down]], [['id', $id]]);
				return $down;
			}
		}
		else {
			return -1;
		}
	}

	// Update solved status
	public function updateSolved($id, $status = 1) {
		return $this->updateTable('thread', [['solved', $status]], [['id', $id]]);
	}

	// Mark spam 
	// Should only be for admin
	public function markSpam($table, $id, $status = 1) {
		return $this->updateTable($table, [['spam_status', $status]], [['id', $id]]);
	}

	// Report spam
	public function reportSpam($table_name, $item_id, $user_id, $user_type = 'fb_id') {
		// Check if user already reported
		$spam_reporter_table = $table_name.'_spam_reporter';
		$id_list = $this->selectFromTable($spam_reporter_table, [[$table_name.'_id', $item_id], [$user_type, $user_id]]);

		if (count($id_list) > 0) {
			// Remove spam report of that user
			$items = $this->selectFromTable($table_name, [['id', $item_id]]);
			$item = count($items) > 0 ? $items[0] : null;
			if (isset($items)) {
				$spam_count = intval($item['spam_count']);
				$this->updateTable($table_name, [['spam_count', --$spam_count]], [['id', $item_id]]);
				$this->deleteFromTable($spam_reporter_table, [[$table_name.'_id', $item_id], [$user_type, $user_id]]);
				return true;
			}
		}
		else {
			// Add new spam report
			$items = $this->selectFromTable($table_name, [['id', $item_id]]);
			$item = count($items) > 0 ? $items[0] : null;
			if (isset($items)) {
				$spam_count = intval($item['spam_count']);
				$this->updateTable($table_name, [['spam_count', ++$spam_count]], [['id', $item_id]]);
				$this->insertIntoTable($spam_reporter_table, [[$table_name.'_id', $item_id], [$user_type, $user_id]]);
				return true;
			}
		}

		return false;
	}


	/***************************************************
	 ***************************************************
	 *********************	Delete 	********************
	 ***************************************************
	 ***************************************************/

	private function deleteFromTable($table, $crits) {
		$query = 'DELETE FROM ' . $table;

		// Argument
		if($crits != null) {
			$query .= ' WHERE ';
			for($i = 0; $i < count($crits) - 1; $i++) {
				$query .= $crits[$i][0] . '= :_' . $crits[$i][0] . ' AND ';
			}
			$query .= $crits[$i][0] . '= :_' . $crits[$i][0];
		}

		// return $query;

		try {
			$stm = $this->dbh->prepare($query);

			// Param Binding
			$values = array();
			foreach ($crits as $crit) {
				$values['_'.$crit[0]] = $crit[1];
			}

			$stm->execute($values);
			return true;
		}
		catch(PDOException $e) {
		    echo $e->getMessage();
		}

		// No result
		return false;
	}

	// Destruction
	public function __destruct() {
		$this->dbh = null;
	}
}