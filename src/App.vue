<template>
    <div id="app">
        <div id="header">
            <router-link to="/">ErabeRule</router-link>
            <router-link to="/attend">参加</router-link>
            <router-link to="/create">作成</router-link>
        </div>

        <router-view></router-view>

        <div id="footer">
            <p>&copy; 2021 Shintaro Aoi</p>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'App'
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
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        min-height: 100vh;
        position: relative;
        padding-bottom: 40px;
    }

    #header {
        background: white;
        box-shadow: 0px 3px 3px rgba(0, 0, 0, 0.1);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    #header a {
        text-decoration: none;
        color: #2c3e50;
        margin: 5px 5px;
        padding: 10px 30px;
        border-radius: 3px;
    }

    #header a:hover {
        text-decoration: none;
        background: rgba(0, 0, 0, 0.05);
    }

    #footer {
        width: 100%;
        height: 40px;
        font-size: 10pt;
        text-align: center;
        color: rgb(100, 100, 100);
        background-color: rgb(245, 245, 245);
        border-top: 1px solid rgb(200, 200, 200);
        cursor: default;
        line-height: 40px;
        position: absolute;
        bottom: 0;
    }

</style>

<!--   npm run dev でローカルホストを立ち上げる   -->
