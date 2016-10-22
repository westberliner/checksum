<?php
/**
 * Load Javascrip
 */

use OCP\Util;

$eventDispatcher = \OC::$server->getEventDispatcher();
$eventDispatcher->addListener('OCA\Files::loadAdditionalScripts', function(){
    Util::addScript('checksum', 'checksum.tabview' );
    Util::addScript('checksum', 'checksum.plugin' );
});

