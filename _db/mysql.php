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

    private function selectCommentsFromTable($filter, $limit) {
        $query = 'SELECT country.name AS countryName, country.nationality as nationality, country.flag as flag, country.color as color, city.name AS cityName, user.name AS userName, user.id AS userId, comment.content AS content, comment.id AS id
            FROM user, comment, country, city WHERE user.id = comment.userId AND user.cityId = city.id AND city.countryId = country.id';

        // Criteria
        if($filter != "all") {
            $query .= " AND country.name = '".$filter."' ";
        }

        $query .= " ORDER BY comment.id DESC ".$limit;

        try {
            $stm = $this->dbh->prepare($query);

            $stm->execute();
            return $stm->fetchAll();
        }
        catch(PDOException $e) {
            echo $e->getMessage();
        }

        // No result
        return null;
    }

	// Select all industries
	public function selectAllComments($filter, $start, $length) {
        $comments = $this->selectCommentsFromTable($filter, "LIMIT $start, $length");
        foreach ($comments as &$cmt) {
            $cmt['userPic'] = 'https://graph.facebook.com/'.$cmt['userId'].'/picture?type=large';
            $images = $this->selectFromTable('image', [['commentId', $cmt['id']]]);
            $cmt['flag'] = './images/flag/'.$cmt['flag'];
            if (sizeof($images) > 0) {
                $cmt['images'] = array();

                foreach ($images as $img) {
                    array_push($cmt['images'],'uploaded_file/'.$img['url']);
                }
            }
        }
        return $comments;
	}

    public function getAllCountry() {
        $countries = $this->selectFromTable('country');
        return $countries;
    }

    public function getUserDetail($userId) {
        $result = array();
        $user = $this->selectFromTable('user',[['id', $userId]]);
        if (sizeof($user) > 0) {
            $result['cityId'] = $user[0]['cityId'];
            $city = $this->selectFromTable('city',[['id', $result['cityId']]]);

            if (sizeof($city) > 0)
                $result['countryId'] = $city[0]['countryId'];
        }
        return $result;
    }

    public function getAllCitiesForACountry($countryId) {
        $cities = $this->selectFromTable('city',[['countryId', $countryId]]);
        return $cities;
    }


    public function insertNewComment($userId, $userName, $cityId, $content, $img) {
        $images = isset($img) ? json_decode($img) : null;

        $user = $this->selectFromTable('user', [['id', $userId]]);

        //user not exists, create
        if (sizeof($user) == 0)
            $this->insertIntoTable('user',
            [
                ['id', $userId],
                ['name', $userName],
                ['cityId', $cityId]
            ]);
        else {
            if ($user[0]['name'] != $userName || $user[0]['cityId'] != $cityId)
                $this->updateTable('user', [['name', $userName],['cityId', $cityId]],
                    [['id', $userId]]);
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

        $city = $this->selectFromTable('city',[['id', $cityId]]);
        $country = $this->selectFromTable('country',[['id', $city[0]['countryId']]]);

        $result['id'] = $commentId;
        $result['flag'] = './images/flag/'.$country[0]['flag'];
        $result['nationality'] = $country[0]['nationality'];
        $result['color'] = $country[0]['color'];
        $result['images'] = $images;
        return $result;
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