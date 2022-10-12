<template>
  <div class="login">
    <div class="login-container">
      <div class="login-main">
        <div class="login-header">
          <div>客服后台示例</div>
        </div>
        <div class="login-form">
          <div class="form-item">
            <div class="selected-area" @click="switchSelectorVisible">
              <div class="selected-content">
                <img v-if="agentSelector.selectedAgent" :src="agentSelector.selectedAgent.shop.avatar"/>
                <div>{{
                    agentSelector.selectedAgent ? agentSelector.selectedAgent.shop.name + ' - ' + agentSelector.selectedAgent.name : '请选择用户'
                  }}
                </div>
              </div>
              <img
                :class="agentSelector.visible ? 'selected-icon' : 'selected-icon rotate'"
                src="../assets/images/up.png"
              />
            </div>
            <div v-if="agentSelector.visible" class="dialog-area">
              <div class="dialog-list">
                <div
                  class="dialog-list-item"
                  v-for="(agent, index) in agentSelector.agents"
                  :key="index"
                  @click="selectAgent(agent)">
                  <img class="dialog-list-item-avatar" :src="agent.shop.avatar"/>
                  <div :class="agentSelector.selectedAgent === agent ? 'selected' : ''">
                    {{ agent.shop.name + ' - ' + agent.name }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="form-item">
            <input v-model="password.value" class="password-input" placeholder="请输入密码"
                   :type="password.visible ? 'text':'password'"/>
            <img v-if="password.visible" class="password-image" @click="switchPasswordVisible"
                 src="../assets/images/invisible.png"/>
            <img v-else class="password-image" @click="switchPasswordVisible" src="../assets/images/visible.png"/>
          </div>
          <div class="form-item">
            <button class="form-item-btn" @click="login">登录</button>
          </div>
          <div v-show="errorVisible" class="form-error">账号或密码错误!</div>
        </div>
        <div class="version">{{ version }}</div>
      </div>
    </div>
  </div>
</template>

<script>
  import restApi from '../api/restapi';
  import { version } from '../../package.json';

  export default {
    name: 'Login',
    data() {
      return {
        version: version,
        agentSelector: {
          agents: [],
          visible: false,
          index: 0,
          selectedAgent: null
        },

        username: '',
        password: {
          visible: false,
          value: '123'
        },

        errorVisible: false,
      };
    },
    created() {
      this.agentSelector.agents = restApi.findAgents();
    },
    methods: {
      switchSelectorVisible() {
        this.agentSelector.visible = !this.agentSelector.visible;
      },
      selectAgent(agent) {
        this.agentSelector.visible = false;
        this.agentSelector.selectedAgent = agent;
        this.username = agent.name;
      },
      switchPasswordVisible() {
        this.password.visible = !this.password.visible;
      },


      login() {
        if (this.username.trim() !== '' && this.password.value.trim() !== '') {
          let agent = restApi.findAgent(this.username, this.password.value);
          if (agent) {
            this.globalData.currentAgent = agent;
            this.$router.replace({path: './conversations'});
            return;
          }
        }
        this.errorVisible = true;
      }
    },
  };
</script>

<style lang="scss" scoped>
  .login {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .login-container {
      width: 1000px;
      height: 600px;
      border-radius: 12px;

      .login-main {
        width: 600px;
        margin: 130px auto;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        .login-header {
          margin: 20px auto;
          width: 300px;
          text-align: center;
          font-size: 30px;
          font-weight: 500;
          color: #d02129;
        }

        .login-form {
          width: 300px;

          .form-item {
            position: relative;
            margin: 30px 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;

            .selected-area {
              width: 280px;
              display: flex;
              align-items: center;
              padding: 5px 10px;
              border: 1px solid #DCDFE6;
              border-radius: 4px;

              .selected-content {
                display: flex;
                align-items: center;
                flex-grow: 1;
                height: 37px;

                img {
                  width: 35px;
                  height: 35px;
                  margin-right: 15px;
                  border-radius: 50%;
                }
              }

              .selected-icon {
                width: 20px;
                height: 20px;
                margin-right: 5px;
              }

              .rotate {
                transform-origin: center;
                transform: rotate(180deg);
              }

            }

            .dialog-area {
              position: absolute;
              top: 55px;
              left: 0;
              width: 300px;
              background: #FFFFFF;
              border: 1px solid #DCDFE6;
              z-index: 99;

              .dialog-list-item {
                width: 100%;
                margin: 15px 0;
                padding-left: 10px;
                display: flex;
                align-items: center;
              }

              .selected {
                font-weight: bold;
              }

              .dialog-list-item-avatar {
                width: 35px;
                height: 35px;
                margin-right: 15px;
                border-radius: 50%;
              }
            }

            .password-input {
              width: 280px;
              height: 37px;
              display: flex;
              align-items: center;
              padding: 5px 10px;
              border: 1px solid #DCDFE6;
              border-radius: 4px;
            }

            .password-image {
              width: 25px;
              height: 25px;
              position: absolute;
              top: 15px;
              right: 15px;
            }

            .form-item-btn {
              width: 100%;
              color: #FFFFFF;
              background-color: #d02129;
              border: none;
              height: 35px;
              cursor: pointer;
              text-align: center;
              font-size: 14px;
              border-radius: 4px;
            }

          }

          .form-error {
            color: #d02129;
            margin-bottom: 22px;
          }

        }

        .version {
          color: #FFFFFF;
        }
      }
    }
  }
</style>
