<template>
  <div class="content">
<!--    <img src="/backicon.png" class="headImg"/>-->

    <div class="scrollArea" @scroll="throttleScroll">
      <div class="authorMsg">by：<br/><br/>屿洺、KK</div>
<!--      <div class="black"></div>-->

      <div ref="topElement"></div>
      <div class="serch-place" :class="{'search-place-pc': isPc}">

        <div :class="searchArea">
          <div class="search">
            <input type="text" v-model="searchKey" @input="debounceSearch" @keydown.enter="debounceSearch"/>
            <button class="search-btn" @click="search">搜索</button>
          </div>
        </div>
        <ShowMap v-if="showMap" :mapList="mapList" class="maplist"></ShowMap>
        <div class="empty" v-if="!showMap">
          <div class="text">{{ hint }}</div>
        </div>
      </div>

    </div>
  </div>
</template>

<style lang="less" scoped>
.content {
  height: 100vh;
  width: 100%;
  flex-direction: column;

  .headImg {
    height: 200px;
    //width: 100%;
    object-fit: contain;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: -1;
  }

  .scrollArea {
    height: 100vh;
    overflow-y: scroll;
    display: flex;
    align-items: center;
    flex-direction: column;

    .authorMsg {
      position: fixed;
      left: 2%;
      //right: 10px;
      top: 10vh;
      margin: auto;
      font-size: 3em;
      //transform: translateX(-50%);
    }

    .black {
      min-height: 100px;
    }

    .serch-place {
      flex: 1;
      // background-color: gray;
      width: 100%;
      border-radius: 20px 20px 0 0;
      padding: 60px 20px 0 20px; //padding-top多留40px给搜索栏让位置
      background-image: linear-gradient(to bottom right, rgba(105, 122, 161) 40%, rgba(231, 182, 193) 100%);
      position: relative; //search-area 为absolute就会跟着跑，为fixed就会驻留


      .search-area {
        z-index: 100;

        position: absolute;
        top: 20px;
        left: 0;
        right: 0;
        padding: 0 20px;

        .search {
          width: 100%;

          display: flex;
          border-radius: 20px;
          border: 2px solid #FFDC01;
          background-color: #fffced;
          overflow: hidden;
          align-items: center;
          font-size: 15px;

          input {
            outline: none;
            background-color: inherit;
            flex: 1;
            height: 100%;
            border: 0;
            padding: 0 20px 0 20px;
            width: 100px;
          }

          .search-btn {
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            font-size: 18px;
            position: relative;
            padding: 6px 15px;
            border-radius: 20px;
            background-color: #FFDC01;
            outline: none;
            border: none;
            overflow: hidden;
            transition: background-color .25s;
          }

          .search-btn::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: radial-gradient(circle, #ff7439 10%, transparent 10.1%);
            transform: scale(10);
            opacity: 0;
            transition: all .6s;
          }

          .search-btn:active::after {
            transform: scale(0);
            opacity: .5;
            transition: 0s;
          }

        }
      }

      .search-area-stay {
        .search-area();
        position: fixed;
      }
    }

    .search-place-pc {
      width: 63% !important;
      padding: 50px 10% !important;

      .maplist {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;

        /deep/ img {
          width: auto !important;
          max-width: 100%;
        }
      }
    }
  }

  .empty {

    .text {
      margin-top: 100px;
      text-align: center;
      white-space: pre-line;
      line-height: 1.5;
      color: #f5f5f5;
      font-weight: 700;
      font-size: 24px;
    }
  }


}
</style>

<script lang="ts" setup>
// import {debounce, test} from '@/utils/utils';
import {isFunction} from '@vue/shared';
import {ref, watch, nextTick, computed} from 'vue';
import ShowMap from './ShowMap.vue'
import {useStore} from 'vuex'
import {pinyin} from "pinyin-pro";
import {debounce, throttle} from "lodash";

let store = useStore();
let showMap = ref(false);
let searchKey = ref('');
let mapList = ref([]);

//搜索框的样式
let searchArea = ref('search-area');

let topElement: any = ref(); //定位元素

function getTop(element: any) {
  let offset = element.getBoundingClientRect().top;
  return offset;
}

const throttleScroll = throttle(scroll, 100)

function scroll () {
  console.log('scroll');
  //要节流
  let ticked = false;
  return () => {
    if (!ticked) {
      ticked = true;
      window.requestAnimationFrame(() => {
        let top = getTop(topElement.value);
        console.log(top);
        if (top > 0) {
          if (searchArea.value != 'search-area') {
            searchArea.value = 'search-area'
          }
        } else {
          if (searchArea.value != 'search-area-stay') {
            searchArea.value = 'search-area-stay'
          }
        }
        ticked = false;
      });
    }
  };
}

/*let scroll = (() => {
  console.log('scroll');
  //要节流
  let ticked = false;
  return () => {
    if (!ticked) {
      ticked = true;
      window.requestAnimationFrame(() => {
        let top = getTop(topElement.value);
        console.log(top);
        if (top > 0) {
          if (searchArea.value != 'search-area') {
            searchArea.value = 'search-area'
          }
        } else {
          if (searchArea.value != 'search-area-stay') {
            searchArea.value = 'search-area-stay'
          }
        }
        ticked = false;
      });
    }
  };
})();*/


let hint = ref('不要输入符号 \n 可以仅输入部分文字');

const debounceSearch = debounce(search, 100)

//搜索
function search() {
  reset(); //要重置前面的参数
  console.log('typeof searchKey: ', typeof searchKey);
  // let list = debounce(searchMap(searchKey.value), 2500);
  let list = searchMap(searchKey.value.trim().toLowerCase());
  if (list.length != 0) {
    mapList.value = list;
    showMap.value = true;
  } else {
    mapList.value = [];
    showMap.value = false;
    hint.value = '搜索失败，看看是不是打错了\n不要输入符号\n可以仅输入部分文字';
  }
}

function reset() {

}

const isPc = computed(() => {
  let ua = window.navigator.userAgent,
      agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPod', 'iPad'],
      isPC = true;
  for (let i = 0, len = agents.length; i < len; i++) {
    if (ua.indexOf(agents[i]) > 0) {
      // 如果找到一个手机标识, 就设置为false并跳出循环
      isPC = false;
      break;
    }
  }
  // console.log('该页面固定为手机端 isPC: ', isPC);
  // return false
  return isPC
})

// 获取带拼音的数组
const searchList = store.state.mapList.map((item: string) => {
  // 获取数组形式不带声调的拼音 pinyin('汉语拼音', {toneType: 'none', type: 'array'}); // ["han", "yu", "pin", "yin"]
  const tail = pinyin(item, {toneType: 'none', type: 'array'}).reduce((a, b) => a + b[0], '')
  return item + tail
})

function searchMap(key: string) {
  //返回一个列表
  const ans: any = [];
  searchList.forEach((value: string, index: number) => {
    if (key != '' && value.indexOf(key) != -1) {
      ans.push(store.state.mapList[index]);
    }
  });
  return ans;
}
</script>
