<template>
  <div>
    <nav>
      <router-link to="/">หน้าแรก</router-link> |
      <router-link to="/about">เกี่ยวกับเรา</router-link>
    </nav>
    <router-view></router-view>
  </div>
</template>

<style>
nav {
  margin-bottom: 20px;
}
nav a {
  margin-right: 10px;
  text-decoration: none;
  color: blue;
}
nav a:hover {
  text-decoration: underline;
}
</style>
