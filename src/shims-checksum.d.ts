import Vue, { VNode } from 'vue'

declare global {
  namespace Checksum {
    interface VueElement extends Vue {
      update: function
    }
    interface OCA {
      Files: {
        Sidebar: {
          Tab: function,
          registerTab: function
        }
      }
    }
    interface FileInfo {
      name: string,
      path: string,
      type: string
    }
    interface IntrinsicElements {
      [elem: string]: any
    }
    interface HashType {
      id: string;
      label: string;
    }
  }
}
