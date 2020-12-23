import {translate as t} from '@nextcloud/l10n'
import axios from '@nextcloud/axios'
import {generateUrl, imagePath} from '@nextcloud/router'
import $ from 'jquery'

export default class ChecksumTab {
  /**
   * Instantiate a new tab.
   */
  constructor(el) {
    this.$el = $(el)
  }

  /**
   * Return associated file info object.
   */
  getFileInfo() {
    return this.fileInfo
  }

  /**
   * Renders this details view.
   */
  render(fileInfo) {
    this.fileInfo = fileInfo
    this._renderSelectList(this.$el)
  }

  _renderSelectList($el) {
    $el.html('<div class="get-checksum">'
      + '<select id="choose-algorithm">'
        + '<option value="">' + t('checksum', 'Choose Algorithm') + '</option>'
        + '<option value="md5">MD5</option>'
        + '<option value="sha1">SHA1</option>'
        + '<option value="sha256">SHA256</option>'
        + '<option value="sha384">SHA384</option>'
        + '<option value="sha512">SHA512</option>'
        + '<option value="crc32">CRC32</option>'
      + '</select></div>'
    )
    $el.find('#choose-algorithm').change((e) => this._onChangeEvent(e))
  }

  /**
   * Ajax callback for generating checksum hash.
   */
  async check(fileInfo, algorithmType) {
    // skip call if fileInfo is null
    if(null == fileInfo) {
      this.updateDisplay({
        response: 'error',
        msg: t('checksum', 'No fileinfo provided.')
      })

      return
    }

    const url = generateUrl('/apps/checksum/check')
    const params = {source: fileInfo.path + fileInfo.name, type: algorithmType}
    const {data} = await axios.get(url, {params})
    this.updateDisplay(data, algorithmType)
  }

  /**
   * Display message from ajax callback.
   */
  updateDisplay(data, algorithmType) {
    let msg = ''
    if('success' == data.response) {
      msg = algorithmType + ': ' + data.msg
    }
    if('error' == data.response) {
      msg = data.msg
    }

    msg += '<br><br><a id="reload-checksum" class="icon icon-history" style="display:block" href=""></a>'
    this.$el.find('.get-checksum').html(msg)
    this.$el.find('#reload-checksum').click((e) => this._onReloadEvent(e))
  }

  /**
   * Handle algorithm change.
   */
  _onChangeEvent(ev) {
    var algorithmType = $(ev.currentTarget).val()
    if(algorithmType != '') {
      this.$el.html('<div style="text-align:center word-wrap:break-word" class="get-checksum"><p><img src="'
        + imagePath('core','loading.gif')
        + '"><br><br></p><p>'
        + t('checksum', 'Creating Checksum ...')
        + '</p></div>')
      this.check(this.getFileInfo(), algorithmType)
    }
  }

  /**
   * Handle form reset.
   */
  _onReloadEvent(ev) {
    ev.preventDefault()
    this._renderSelectList(this.$el)
  }
}
