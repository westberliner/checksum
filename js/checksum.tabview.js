(function() {

  var ChecksumTabView = OCA.Files.DetailTabView.extend({

    id: 'checksumTabView',
    className: 'tab checksumTabView',

    /**
     * get label of tab
     */
    getLabel: function() {

      return t('checksum', 'Checksum');

    },

    /**
     * Renders this details view
     *
     * @abstract
     */
    render: function() {

      this.$el.html('<div style="text-align:center;" class="get-md5"><p><img src="'
        + OC.imagePath('core','loading.gif')
        + '"><br><br></p><p>'
        + t('checksum', 'Creating MD5 Checksum ...')
        + '</p></div>');
      this.check(this.getFileInfo());

    },

    /**
     * show tab only on files
     */
    canDisplay: function(fileInfo) {

      if(fileInfo != null) {
        if(!fileInfo.isDirectory()) {
          return true;
        }
      }
      return false;

    },

    /**
     * ajax callback for generating md5 hash
     */
    check: function(fileInfo) {

      var url = OC.generateUrl('/apps/checksum/check'),
          data = {source: fileInfo.getFullPath()},
          _self = this;
      $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        data: data,
        async: true,
        success: function(data) {
          _self.updateDisplay(data);
        }
      });

    },

    /**
     * display message from ajax callback
     */
    updateDisplay: function(data) {

      var msg = '';
      if('success' == data.response) {
        msg = 'MD5: ' + data.msg;
      }
      if('error' == data.response) {
        msg = data.msg;
      }
      this.$el.find('.get-md5').html(msg);
    }

  });

  OCA.Checksum = OCA.Checksum || {};

  OCA.Checksum.ChecksumTabView = ChecksumTabView;

})();