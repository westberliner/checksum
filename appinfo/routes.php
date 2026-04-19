<?php

return [
	'routes' => [
		['name' => 'checksum#check', 'url' => '/check', 'verb' => 'GET'],
	],
	'ocs' => [
		['name' => 'checksumApi#compute', 'url' => '/api/v1/checksum', 'verb' => 'GET'],
	],
];
