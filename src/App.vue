<template>
  <div id="app">
    <div id="header">
      <router-link to="/" class="logo">
        <img src="./assets/logo_img.png">
        <span>ErabeRule</span>
      </router-link>
      <div class="prtition-line"></div>
      <router-link to="/attend" class="header-link">参加</router-link>
      <router-link to="/create" class="header-link">作成</router-link>
    </div>

    <router-view></router-view>

    <div id="footer">
      <p>&copy; 2021 Shintaro Aoi</p>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'App',

    created: function() {
      document.title = "ErabeRule"
    }
  }
</script>

<style>
  *,
  *:before,
  *:after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
  }

  #app {
    font-family: source-han-sans-japanese, sans-serif;
    font-weight: 400;
    font-style: normal;
    text-align: center;
    font-size: 11pt;
    color: rgb(20, 20, 20);
    background: #F9F9F9;
    min-height: 100vh;
    position: relative;
    padding-bottom: 40px;
  }

  #header {
    background: #fcfcfc;
    border-bottom: 1px solid rgb(180, 180, 180);
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  #header a {
    text-decoration: none;
    color: rgb(60, 60, 60);
    border-radius: 5px;
  }

  #header a:hover {
    text-decoration: none;
    background: rgba(0, 0, 0, 0.05);
  }

  .prtition-line {
    margin: 0 10px;
    height: 30px;
    width: 1px;
    background: rgb(180, 180, 180);
  }

  .header-link {
    margin: 5px 10px;
    padding: 5px 10px;
  }

  .logo {
    font-weight: 700;
    max-height: 100px;
    margin: 10px 5px 10px 10px;
    padding: 5px 5px;
    font-size: 14pt;
  }

  .logo img {
    width: 40px;
    height: 40px;
    border-radius: 9px;
    vertical-align: middle;
  }

  .logo span {
    vertical-align: middle;
    margin: 0 10px;
  }

  ul {
    margin: 0;
    padding: 0;
  }

  #footer {
    width: 100%;
    height: 40px;
    font-size: 10pt;
    text-align: center;
    color: rgb(100, 100, 100);
    background-color: rgb(240, 240, 240);
    border-top: 1px solid rgb(200, 200, 200);
    cursor: default;
    position: absolute;
    bottom: 0;
  }
</style>

<!--   npm run dev でローカルホストを立ち上げる   -->
