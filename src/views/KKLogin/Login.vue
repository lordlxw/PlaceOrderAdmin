<!--登录页面-->
<template>
  <transition
    appear
    name="fade"
    @before-enter="handleBeforeEnter"
    @enter="handleEnter"
    @after-enter="handleAfterEnter"
  >
    <div
      class="login-wrapper"
      :style="
        `background: ${
          $appType == 'server'
            ? 'linear-gradient(to bottom, #2cad98 30%, #5270bd 100%)'
            : 'linear-gradient(to bottom, #FF9800 30%, #4CAF50 100%)'
        }`
      "
    >
      <title-bar
        v-if="isElectron"
        :bgColor="$appType == 'server' ? '#2cad98' : '#FF9800'"
      >
        <i
          slot="right_bar"
          @click="getNetworkDia()"
          class="el-icon-info noDrag txt-white right_bar"
        ></i>
      </title-bar>
      <!-- <el-image
        class="logo"
        :src="require('@/assets/images/logo.png')"
      ></el-image> -->
      <div class="login-body">
        <div class="login-title">
          Lily{{ labelPosition == "lily" ? "管理" : "模拟" }}系统
        </div>
        <transition
          appear
          @before-enter="handleFormBeforeEnter"
          @enter="handleFormEnter"
        >
          <el-form
            :model="ruleForm"
            :rules="rules"
            ref="ruleForm"
            class="login-form"
            size="medium"
          >
            <div class="tit">登录</div>
            <el-form-item prop="username">
              <el-input
                placeholder="请输入账号"
                prefix-icon="el-icon-user"
                v-model="ruleForm.username"
                @keyup.enter.native="submitForm('ruleForm')"
                size="large"
              >
              </el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                placeholder="请输入密码"
                prefix-icon="el-icon-lock"
                v-model="ruleForm.password"
                show-password
                @keyup.enter.native="submitForm('ruleForm')"
                size="medium"
              >
              </el-input>
            </el-form-item>
            <el-form-item v-if="$appType == 'all'">
              <el-radio-group v-model="labelPosition" size="small">
                <el-radio-button label="lily">管理</el-radio-button>
              </el-radio-group>
              <div class="checkbox-group">
                <label>
                  <input
                    type="radio"
                    v-model="selectedOption"
                    value="isSimulation"
                  />
                  模拟
                </label>
                <label>
                  <input
                    type="radio"
                    v-model="selectedOption"
                    value="isTesting"
                  />
                  测试
                </label>
                <label>
                  <input type="radio" v-model="selectedOption" value="isUAT" />
                  UAT
                </label>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                class="btn-login"
                @click="submitForm('ruleForm')"
                size="medium"
                >进入系统</el-button
              >
            </el-form-item>
          </el-form>
        </transition>
        <div class="icp" v-if="!isElectron">
          <a href="http://beian.miit.gov.cn" target="_blank"
            >琼ICP备2023001153号-1</a
          >
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import Velocity from "velocity-animate";
import api from "@/api/kk_login";
import { debounce } from "@/utils/debounce";
import configUtil from "@/utils/config.js";
import * as util from "@/utils/util";
const crypto = require("crypto");
export default {
  data() {
    return {
      macAddress: "",
      hwMD5: "",
      show: true,
      ruleForm: {
        username: "",
        password: "",
        uuid: "",
        code: ""
      },
      rules: {
        username: [{ required: true, message: "账号必填", trigger: "blue" }],
        password: [{ required: true, message: "密码必填", trigger: "blue" }]
      },
      labelPosition: "Simulation",
      selectedOption: "isSimulation", // 默认选中 "模拟"
      isElectron: false
    };
  },
  computed: {
    ...mapState({
      socketMain: state => state.socketMain
    })
  },
  created() {
    if (window.v1) {
      this.isElectron = window.v1.isElectron();
    }
    console.log(this.$appType);
    this.labelPosition = this.$appType === "client" ? "Simulation" : "lily";
  },
  methods: {
    getMacAddress() {
      try {
        var os = require("os");
        var mac = os.networkInterfaces();
        console.log("mac123", mac);
        console.log("getMacAddress方法执行~");
        // 调用
        return "111";
      } catch (error) {
        console.error("获取 MAC 地址时发生错误:", error);
        return ""; // 发生错误时返回空字符串或者你希望的默认值
      }
    },
    getMD5Hash(value) {
      return crypto
        .createHash("md5")
        .update(value, "utf8")
        .digest("hex")
        .toUpperCase(); // 输出大写
    },
    ...mapMutations(["SET_SOCKET_MAIN", "SET_SOCKET_KLINE"]),
    submitForm: debounce(function(formName) {
      const { mac } = this.isElectron
        ? window.v1.getNetwork()
        : { mac: "cc:5e:f8:f0:5f:85" };
      console.log("mac:", mac);
      console.log("labelPosition:", this.labelPosition);
      this.$store.commit("SET_ENVIRONMENT", this.selectedOption);
      const hwinfo = this.$md5(mac.replace(/:/g, ""));
      console.log("hwinfo");
      console.log(hwinfo);
      this.$refs[formName].validate(valid => {
        if (valid) {
          api
            .login(
              {
                username: this.ruleForm.username,
                password: this.ruleForm.password,
                uuid: this.uuid,
                code: this.ruleForm.code,
                hwinfo: hwinfo
              },
              this.labelPosition === "Simulation" ? "BondHelper" : "BondHelper",
              this.labelPosition === "Simulation" ? "sim" : "admin"
            )
            .then(response => {
              if (response && response.code === 200) {
                // 保存token信息
                Promise.all([
                  this.$store.commit("SET_TOKEN", response.token)
                ]).then(() => {
                  api.auth().then(async response => {
                    if (response && response.code === 200) {
                      const { value: brokers } = await api.chatReceiver();
                      this.$store.commit("SET_USER_INFO", {
                        permissions: response.permissions,
                        userName: response.user.userName,
                        userId: response.user.userId,
                        roleName: response.user.roles[0].roleName,
                        menutree: response.menutree,
                        brokers: brokers,
                        ...response.user
                      });
                    }
                    let $path = "/simulation/main";
                    if (this.labelPosition === "lily") {
                      $path = "/dashboard";
                    }

                    if (this.isElectron) {
                      const displays = await window.v1.getAllDisplays();
                      this.$store.commit("SET_WIN_INFO", {
                        displays
                      });
                      if (this.labelPosition === "lily") {
                        const maxWidth = Math.max(
                          ...displays.map(display => display.bounds.width)
                        );
                        const minWidth = Math.ceil(maxWidth * 0.7);
                        const minHeight = Math.ceil(minWidth * 0.6);
                        // const maxWidth = Math.ceil(maxWidth * 2);
                        // const maxHeight = Math.ceil(minWidth * 2);
                        const args = {
                          id: "main",
                          width: minWidth * 1.5, // 窗口宽度
                          height: minHeight, // 窗口高度
                          isMainWin: true,
                          resize: true, // 是否支持缩放
                          maximize: false, // 最大化窗口
                          isMultiWin: true, // 是否支持多开窗口
                          route: $path
                        };

                        console.log(args);
                        window.v1
                          .createWin(args)
                          .then(response => {
                            window.v1.close();
                          })
                          .catch(error => {
                            // 处理错误
                            console.error(error);
                          });
                      } else {
                        const { code, value, message } = await api.getProfile(
                          response.user.userId
                        );
                        if (code !== "00000") {
                          return this.$message({
                            message: `${message}`,
                            type: "error"
                          });
                        }
                        const klineWins =
                          value && value.wins ? JSON.parse(value.wins) : [];
                        if (
                          klineWins.length > 0 &&
                          this.labelPosition !== "lily"
                        ) {
                          klineWins.forEach((args, index) => {
                            window.v1
                              .createWin(args)
                              .then(response => {
                                console.log("args: ", response, args);
                              })
                              .catch(error => {
                                // 处理错误
                                console.error(error);
                              });
                          });
                          window.v1.close();
                        } else {
                          const maxWidth = Math.max(
                            ...displays.map(display => display.bounds.width)
                          );
                          const minWidth = Math.ceil(maxWidth / 2 + 100);
                          const minHeight = Math.ceil(minWidth * 0.63);

                          // const maxWidth = Math.max(...displays.map(display => display.bounds.width));
                          // const minWidth = Math.ceil(maxWidth * 0.7);
                          // const minHeight = Math.ceil(minWidth * 0.6);
                          const args = {
                            width: minWidth, // 窗口宽度
                            height: minHeight, // 窗口高度
                            minWidth: minWidth, // 窗口最小宽度
                            maxWidth: minWidth,
                            isMainWin: true,
                            resize: true, // 是否支持缩放
                            maximize: false, // 最大化窗口
                            isMultiWin: true, // 是否支持多开窗口
                            route: $path
                          };

                          console.log(args);
                          window.v1
                            .createWin(args)
                            .then(response => {
                              window.v1.close();
                            })
                            .catch(error => {
                              // 处理错误
                              console.error(error);
                            });
                        }
                      }
                    } else {
                      this.$router.push({ path: $path });
                    }
                  });
                });
              } else {
                this.$message({
                  message: `${response.message}`,
                  type: "error"
                });
              }
            });
        } else {
          this.$message.error("验证失败");
        }
      });
    }),
    handleBeforeEnter: el => {
      el.style.opacity = 0;
    },
    handleEnter: (el, done) => {
      Velocity(
        el,
        {
          opacity: 1
        },
        {
          duration: 1000,
          complete: done
        }
      );
    },
    handleAfterEnter: el => {},
    handleFormBeforeEnter: el => {
      el.style.opacity = 0;
      Velocity(el, {
        scale: 0.5,
        scaleX: 0.5,
        scaleY: 0.5
      });
    },
    handleFormEnter: (el, done) => {
      Velocity(
        el,
        {
          opacity: 1,
          scale: 1,
          scaleX: 1,
          scaleY: 1
        },
        {
          duration: 1000,
          complete: done
        }
      );
    },
    getNetworkDia() {
      if (this.ruleForm.username) {
        const { mac, name } = this.isElectron
          ? window.v1.getNetwork()
          : { mac: "cc:5e:f8:f0:5f:85", name: "测试机器" };
        const hwinfo = this.$md5(
          this.$md5(mac.replace(/:/g, "")) + this.ruleForm.username
        );
        // const confirmMsg = `机器名: ${name}, \r\n硬件信息: ${hwinfo}`;
        const h = this.$createElement;
        this.$msgbox({
          title: "",
          message: h("p", null, [
            h("p", `机器名: ${name}`),
            h("p", `硬件信息: ${hwinfo}`)
          ]),
          confirmButtonText: "复制",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            // 使用方法
            util.copyTextToClipboard(hwinfo);
            this.$message({
              type: "success",
              message: "复制成功!"
            });
          })
          .catch(() => {});
      } else {
        this.$message({
          type: "error",
          message: "请输入您需要绑定用户名!"
        });
      }
    }
  },
  async mounted() {
    // 获取 MAC 地址
    this.macAddress = this.getMacAddress();
    console.log("macAddress", this.macAddress);
    // 获取并计算 MD5
    this.hwMD5 = this.getMD5Hash(this.macAddress);
    console.log("hwMD5", this.hwMD5);
    if (!this.isElectron) {
      if (
        localStorage.getItem(configUtil.keys.tokenKey) &&
        localStorage.getItem(configUtil.keys.tokenKey) !== "null"
      ) {
        const { code } = await api.verifyToken(
          localStorage.getItem(configUtil.keys.tokenKey)
        );
        if (code === "00000") {
          this.$router.push({ path: "/trade/bonds" });
        }
      } else {
        if (this.socketMain != null) {
          this.socketMain.close();
        }
        this["SET_SOCKET_MAIN"](null);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/style.scss";

.checkbox-group {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 20px; /* 控制 checkbox 间的间距 */
  margin-top: 10px; /* 控制整个 checkbox group 的上边距 */
}

.checkbox-group label {
  font-size: 14px; /* 设置字体大小 */
  color: #333; /* 设置字体颜色 */
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.checkbox-group input[type="checkbox"] {
  width: 18px; /* 设置勾选框的宽度 */
  height: 18px; /* 设置勾选框的高度 */
  margin-right: 8px; /* 控制勾选框和文字之间的间距 */
  border: 2px solid #ccc; /* 边框颜色 */
  border-radius: 4px; /* 设置圆角效果 */
  appearance: none; /* 去掉默认的样式 */
  outline: none; /* 去掉焦点轮廓 */
  background-color: #f9f9f9; /* 设置背景颜色 */
  transition: background-color 0.3s, border-color 0.3s; /* 动画效果 */
}

/* 鼠标悬停效果 */
.checkbox-group input[type="checkbox"]:hover {
  border-color: #007bff; /* 鼠标悬停时改变边框颜色 */
  background-color: #e6f7ff; /* 鼠标悬停时改变背景颜色 */
}

/* 选中状态 */
.checkbox-group input[type="checkbox"]:checked {
  background-color: #007bff; /* 选中时背景色 */
  border-color: #007bff; /* 选中时边框颜色 */
}

/* 自定义勾选框样式 */
.checkbox-group input[type="checkbox"]:checked::after {
  content: "✔"; /* 添加勾选标志 */
  color: white; /* 勾选标志的颜色 */
  font-size: 12px; /* 勾选标志的字体大小 */
  position: absolute;
  top: 2px;
  left: 4px;
}

/* 设置字体颜色，悬停时加点动画 */
.checkbox-group input[type="checkbox"]:checked + span {
  color: #007bff;
  font-weight: bold;
}

/* 标签 hover 效果 */
.checkbox-group label:hover {
  color: #007bff; /* 鼠标悬停时文字颜色变化 */
  transition: color 0.3s ease;
}

.login-wrapper {
  height: 100%;
  background: $background-style;

  .login-body {
    position: absolute;
    top: 45%;
    transform: translateY(-50%);
    /* 如需水平居中，还需添加以下属性 */
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .login-title-e {
    text-align: left;
    font-size: 18px;
    color: white;
    line-height: 40px;
    margin-left: 10px;
  }

  .login-title {
    text-align: center;
    font-size: 26px;
    color: white;
    font-weight: bold;
    line-height: 60px;
  }

  .logo {
    width: 60px;
    margin: auto;
    display: block !important;
  }

  h3 {
    font-size: 30px;
    color: white;
    text-align: center;
  }

  .login-form {
    width: 324px;
    margin: auto;
    border-radius: 5px;
    background: white;
    padding: 10px 30px;
    box-shadow: 0 0 10px #333;

    .tit {
      color: $body-btn-hover;
      text-align: center;
      font-size: 18px;
      line-height: 60px;
    }

    .code {
      position: relative;

      .img {
        position: absolute;
        left: 175px;
        top: 0;
        cursor: pointer;
      }
    }

    .btn-login {
      margin: auto;
      display: block;
    }
  }
}

.icp {
  text-align: center;
  margin-top: 20px;

  a {
    color: white;
  }

  a:hover {
    color: rgb(240, 238, 238);
  }
}

.right_bar {
  width: 40px;
  height: 40px;
  font-size: 20px;
  line-height: 40px;
  color: #fff;
  text-align: center;
  -webkit-app-region: no-drag;
}
</style>
