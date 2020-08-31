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
        columns: '1', // 幾欄：一欄、二欄
        result: [
          {
            name: '',
            img: '',
            url: '',
            alt: '',
            hover: false // 要不要執行被 hover 的提示效果
          }
        ]
      }
    ],

    // 所有區塊裡，如果有出現一個是「二欄」的就改為 true，<td> 是單欄的部份就會包上 colspan="2"
    templateColspan: false,

    download: false, // 是否按了下載
    downloadHTML: null // 下載的內容

  },
  methods: {
    // 編輯區 hover 時，預覽區的提示
    hoverEffect(i, hover, e) {
      let td = document.querySelectorAll('.hover-effect');
      hover === 'over' ? td[i].classList.add('effect') : td[i].classList.remove('effect')
    },

    // 新增區塊
    addTemplate() {
      let item = {
        columns: '1',
        result: [
          {
            name: '',
            img: '',
            url: '',
            alt: '',
            hover: false
          }
        ]
      };
      this.template.push(item)
    },

    // 刪除區塊
    removeTemplate() {
      this.template.pop();
    },

    // 查所有區塊中，有沒有是「二欄」的
    checkColumns(i) {
      // 原本的資料整個洗掉
      if(this.template[i].item === 1) {
        this.template[i].result = [
          {
            name: '',
            img: '',
            url: '',
            alt: '',
            hover: false
          }
        ]
      } else {
        this.template[i].result = [
          {
            name: '',
            img: '',
            url: '',
            alt: '',
            hover: false
          },
          {
            name: '',
            img: '',
            url: '',
            alt: '',
            hover: false
          }
        ]
      }
      

      let result = false;
      Array.prototype.forEach.call(this.template, t => {
        if(t.columns === '2') {
          return result = true;
        }
      });
      this.templateColspan = result;
    },

    // 抓上傳的圖
    async previewImg(i, result, event) {
      this.template[i].result[result].name = event.target.files[0].name;

      var file = event.target.files[0];
      var reader = new FileReader();

      reader.addEventListener('load', () => {
        this.template[i].result[result].img = reader.result;
      }, false);
    
      if(file) reader.readAsDataURL(file);

    },

    // 確認版型
    downloadTemplate() {

      // 替換 title, url
      const output = document.getElementById('output');
      output.querySelector('title').innerHTML = this.title; // 標題
      output.querySelector('#js-url').href = this.url; // url

      // 替換 max-width
      const dataMaxWidth = document.querySelectorAll('[data-maxwidth]');
      Array.prototype.forEach.call(dataMaxWidth, data => {
        data.style.maxWidth = this.maxWidth + 'px';
      })

      // 加上圖片內容
      const imgContent = document.getElementById('js-content');
      imgContent.innerHTML = '';
      Array.prototype.forEach.call(this.template, t => {
        let item, tdWidth;

        // 單欄
        if(t.columns === '1') {
          tdWidth = this.maxWidth;
          if(t.result[0].url !== '') {
            item = `
              <tr class="m-100">
                <td class="m-100" valign='middle' align='center' width="${tdWidth}" colspan="${this.templateColspan ? '2' : '1'}">
                  <a href="${t.result[0].url}" target="_blank" style="display: block;">
                    <img style="display: block; max-width: 100%;" src="${t.result[0].name}" alt="${t.result[0].alt}">
                  </a>
                </td>
              </tr>
            `;
          } else {
            item = `
              <tr class="m-100">
                <td class="m-100" valign='middle' align='center' width="${tdWidth}" colspan="${this.templateColspan ? '2' : '1'}">
                  <img style="display: block; max-width: 100%;" src="${t.result[0].name}" alt="${t.result[0].alt}">
                </td>
              </tr>
            `;
          }
        }
        
        // 雙欄
        if(t.columns === '2') {
          tdWidth = this.maxWidth / 2; // td 的寬度就是最大寬的一半
          let itemLeft, itemRight; // 左、右欄的 HTML

          // 左
          if(t.result[0].url !== '') {
            itemLeft = `
              <td class="m-100" valign='middle' align='center' width="${tdWidth}">
                <a href="${t.result[0].url}" target="_blank" style="display: block;">
                  <img style="display: block; max-width: 100%;" src="${t.result[0].name}" alt="${t.result[0].alt}">
                </a>
              </td>
            `;
          } else {
            itemLeft = `
              <td class="m-100" valign='middle' align='center' width="${tdWidth}">
                <img style="display: block; max-width: 100%;" src="${t.result[0].name}" alt="${t.result[0].alt}">
              </td>
            `;
          }

          // 右
          if(t.result[1].url !== '') {
            itemRight = `
              <td class="m-100" valign='middle' align='center' width="${tdWidth}">
                <a href="${t.result[1].url}" target="_blank" style="display: block;">
                  <img style="display: block; max-width: 100%;" src="${t.result[1].name}" alt="${t.result[1].alt}">
                </a>
              </td>
            `;
          } else {
            itemRight = `
              <td class="m-100" valign='middle' align='center' width="${tdWidth}">
                <img style="display: block; max-width: 100%;" src="${t.result[1].name}" alt="${t.result[1].alt}">
              </td>
            `;
          }

          // 合併左、右
          item = `
            <tr class="m-100">
              ${itemLeft}
              ${itemRight}
            </tr>
          `;
        }
        
        imgContent.insertAdjacentHTML('beforeend', item);
      });



      // 替換 HTML
      this.downloadHTML = document.getElementById('output').outerHTML.replace('<main id="output">', '<!DOCTYPE html><html>').replace('</main>', '</html>').replace(/<div class="js-width-start"><\/div>/g, '<!--[if (gte mso 9)|(IE)]><table width="' + this.maxWidth + '" data-width cellpadding="0" cellspacing="0" border="0" align="center"><tr><td><![endif]-->');

      // 包成 zip 下載
      var zip = new JSZip();
      zip.file('index.html', this.downloadHTML);
      Array.prototype.forEach.call(this.template, t => {
        Array.prototype.forEach.call(t.result, r => {
          zip.file(r.name, r.img.split(',')[1], { base64: true })
        })
      });
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
  }
});