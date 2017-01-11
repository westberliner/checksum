owncloud-checksum
=================

Owncloud Plugin to create md5-hashes of files.


Installation
------------

- Copy the checksum folder in the app directory of owncloud.
- If not already done, rename the app-folder to "checksum" - causes overwise an sql error.
- Enable this app in the admin interface.


Usage
-----

Open the details view. There should be a new tab called "Checksum". Select a hashalgorithm and it will try to generate a hash.


Notice
------

- I only tested the app for the current version of owncloud (9.x). I tried to use the current api as much as possible. It should be safe for future versions.
- Tested and worked with Nextcloud 10.x too. 
