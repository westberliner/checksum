<?php

define('PHPUNIT_RUN', 1);
use Composer\Autoload\ClassLoader;

include_once __DIR__.'/vendor/autoload.php';
$serverPath = __DIR__ . '/../nextcloud';
include_once $serverPath.'/3rdparty/autoload.php';
require_once $serverPath. '/lib/base.php';

$classLoader = new ClassLoader();
$classLoader->addPsr4("OCP\\", $serverPath . '/lib/public', true);
$classLoader->addPsr4("OC\\", $serverPath . '/lib/private', true);
$classLoader->register();
