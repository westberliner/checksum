(function() {

  OCA.Checksum = OCA.Checksum || {};

  /**
   * @namespace
   */
  OCA.Checksum.Util = {

    /**
     * Initialize the Checksum plugin.
     *
     * @param {OCA.Files.FileList} fileList file list to be extended
     */
    attach: function(fileList) {

      if (fileList.id === 'trashbin' || fileList.id === 'files.public') {
        return;
      }

      fileList.registerTabView(new OCA.Checksum.ChecksumTabView('checksumTabView', {}));

    }
  };
})();

OC.Plugins.register('OCA.Files.FileList', OCA.Checksum.Util);
