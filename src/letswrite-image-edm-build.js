import "@babel/polyfill";
import saveAs from 'file-saver';
import Swal from 'sweetalert2';

const Lego = new Vue({
  el: '#app',
  data: {
    maxWidth: 800, // 最大寬度
    title: '', // 頁面標題
    url: '', // EDM的網址
    templateSum: 1, // 區塊有幾個

    // 各區塊的資訊
    template: [
      {
        name: '',
        img: '',
        url: '',
        alt: ''
      }
    ],

    download: false, // 是否按了下載
    downloadHTML: null // 下載的內容

  },
  methods: {
    // 編輯區 hover 時，預覽區的提示
    alertBlock(i, hover) {
      let img = document.querySelectorAll('#content-wrap img');
      hover === 'over' ? img[i].classList.add('alert') : img[i].classList.remove('alert')
    },

    // 新增區塊
    addTemplate() {
      let item = {
        name: '',
        img: '',
        url: '',
        alt: ''
      };
      this.template.push(item)
    },

    // 刪除區塊
    removeTemplate() {
      this.template.pop();
    },

    // 抓上傳的圖
    previewImg(i, event) {
      this.template[i].name = event.target.files[0].name;

      var file = event.target.files[0];
      var reader = new FileReader();

      reader.addEventListener('load', () => {
        this.template[i].img = reader.result;
      }, false);
    
      if(file) reader.readAsDataURL(file);
    },

    // 確認版型
    downloadTemplate() {

      // 替換 title
      const output = document.getElementById('output');

      // 替換 max-width
      const dataMaxWidth = document.querySelectorAll('[data-maxwidth]');
      Array.prototype.forEach.call(dataMaxWidth, data => {
        data.style.maxWidth = this.maxWidth + 'px';
      })

      // 加上圖片內容
      const imgContent = document.getElementById('js-content');
      imgContent.innerHTML = '';
      Array.prototype.forEach.call(this.template, t => {
        let item;
        if(t.url !== '') {
          item = `
            <a href="${t.url}" target="_blank">
              <img style="display: block; max-width: 100%;" src="${t.name}" alt="${t.alt}">
            </a>
          `;
        } else {
          item = `<img style="display: block; max-width: 100%;" src="${t.name}" alt="${t.alt}">`;
        }
        imgContent.insertAdjacentHTML('beforeend', item);
      });

      output.querySelector('title').innerHTML = this.title; // 替換標題
      output.querySelector('#js-url').href = this.url; // 替換 url

      // 替換 HTML
      this.downloadHTML = document.getElementById('output').outerHTML.replace('<main id="output">', '<!DOCTYPE html><html>').replace('</main>', '</html>').replace(/<div class="js-width-start"><\/div>/g, '<!--[if (gte mso 9)|(IE)]><table width="' + this.maxWidth + '" data-width cellpadding="0" cellspacing="0" border="0" align="center"><tr><td><![endif]-->');

      // 包成 zip 下載
      var zip = new JSZip();
      zip.file('index.html', this.downloadHTML);
      Array.prototype.forEach.call(this.template, t => zip.file(t.name, t.img.split(',')[1], { base64: true }));
      zip.generateAsync({type:"blob"}).then(content => {
        saveAs(content, 'edm.zip');
        Swal.fire(
          'EDM製作完成',
          '本功能筆記文請至 <a style="color: #00A7E5" href="https://letswrite.tw/image-edm-build/" target="_blank">用Vue.js製作圖片版EDM生成器</a> 觀看。',
          'success'
        )
      });

    },
  },
  mounted() {
    // 是IE時跳通知
    if(navigator.userAgent.indexOf('Trident') > -1) {
      Swal.fire(
        '本頁不支援IE',
        '本頁用了許多新的寫法，在 IE 上會有不支援的情況。<br/>請改用其它瀏覽器。',
        'error'
      )
    }
  },
  watch: {
    maxWidth: function(val) {
      if(val > 800) {
        this.maxWidth = 800;
      }
    }
  },
});