<?php
// chech if app is enabled
OCP\JSON::checkAppEnabled('checksum');

// get file
$source = $_GET['source'];
if($info = \OC\Files\Filesystem::getLocalFile($source)){
  $md5 = md5_file($info);
  OCP\JSON::success(array('data' => array($md5)));
} else {
  OCP\JSON::error(array('data' => array('An Error occured.')));
};


