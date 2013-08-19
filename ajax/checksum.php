<?php
// chech if app is enabled
OCP\JSON::checkAppEnabled('checksum');
OCP\JSON::checkLoggedIn();
OCP\JSON::callCheck();

// get file
$source = $_GET['source'];
$dir = $_GET['dir'];
$file = $dir.$source;
if($info = \OC\Files\Filesystem::getLocalFile($file)){
  $md5 = md5_file($info);
  OCP\JSON::success(array('data' => array($md5)));
} else {
  OCP\JSON::error(array('data' => array('An Error occured.')));
};


