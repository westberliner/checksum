(function($){
  var checksum = {
    init: function() {
      if (typeof FileActions !== 'undefined') {
        FileActions.register(
          'all',
          t('checksum','checksum'),
          OC.PERMISSION_READ,
          OC.imagePath('core','actions/info'),
          checksum.check
        );
      };
    },
    check: function(file) {
      var elem = this.elem;
      if(!elem){
        elem = this.currentFile;
      }
      
      dom = elem.find('.action[data-action=checksum]');
      if(!dom.hasClass('chcksum-hashed')) {
        dom.html(checksum.load);
        dom.addClass('checksum-hashing');
        checksum.ajax(file);
      } else {
        alert(dom.html());
      }
    },
    load: 'Creating MD5 Checksum <img src="'+OC.imagePath('core','loading.gif')+'">',
    ajax: function(file) {

      var url = OC.generateUrl('/apps/checksum/checksum');
      var data = {source: file, dir: $('#dir').val()+'/'};
      $.ajax({
      type: 'GET',
      url: url,
      dataType: 'json',
      data: data,
      async: true,
      success: function(info) {
        dom = $('.checksum-hashing').first();
        dom.text('MD5: '+info.checksum);
        dom.addClass('chcksum-hashed');
        dom.removeClass('checksum-hashing');
      }
    });
    }
  }
  $(document).ready(checksum.init);
})(jQuery)
