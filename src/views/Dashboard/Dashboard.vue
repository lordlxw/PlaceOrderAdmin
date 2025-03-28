<template>
  <div class="content">
    <title-bar v-if="child">
    </title-bar>
    <div class="content custom-scrollbar">
      <el-row class="board-header">
        <el-col :span="24">
          <div class="do">
            <el-row>
              <el-col :span="12">
                <el-radio-group v-model="productGroups" size="small" v-if="setAuth('system:alltrans:query')">
                  <el-radio-button v-for="product in products" :label="product.id" :key="product.id"
                    >{{ product.name
                    }}</el-radio-button>
                </el-radio-group>
              </el-col>
              <el-col :span="setAuth('system:alltrans:query') ? 12 : 24" class="text-right">
                <el-date-picker v-model="searchParam.date" type="daterange" align="right" unlink-panels
                  :clearable="false" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
                  value-format="yyyy-MM-dd" :picker-options="pickerOptions">
                </el-date-picker>
              </el-col>
            </el-row>
          </div>
        </el-col>
      </el-row>
      <el-row class="board-echats">
        <el-col :span="24" style="background-color: #f0f0f0; padding: 20px;margin-left: 2px;">
          <el-switch
          style="margin-top: 20px; font-size: 38px;"
          v-model="switchValue"
          size="large"
          active-text="通道"
          inactive-text="个人"
        />
          <!-- <button @click="applyDateRange">点击触发</button> -->
          <div ref="main-chart" style="width: 100%; height: 300px"></div>

        </el-col>
        <!-- <el-col :span="8">
          <div class="board-echats-box">
            <div ref="chartA" class="chart"></div>
            <div class="chartA-btn">
              <el-radio-group v-model="eChartRadioA" size="mini" @change="initChartA(initChartDataA)">
                <el-radio-button :label="0">交易量</el-radio-button>
                <el-radio-button :label="1">交易笔数</el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </el-col>
        <template v-if="setAuth('system:alltrans:query')">
          <el-col :span="8">
            <div class="board-echats-box" v-if="setAuth('system:alltrans:query')">
              <div ref="chartB" class="chart"></div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="board-echats-box" v-if="setAuth('system:alltrans:query')">
              <div ref="chartC" class="chart"></div>
            </div>
          </el-col>
        </template>
        <template v-else>
          <el-col :span="16">
            <div class="board-echats-box">
              <div class="pd10">
                <account-risk-control
                  :userId="searchParam.userIds.length > 0 ? searchParam.userIds[0] : ''"></account-risk-control>
              </div>
            </div>
          </el-col>
        </template> -->
      </el-row>
      <el-row class="board-user">
        <el-col :span="24">
          <com-user-summary :height="310" :searchParam="searchParam" @init="initChartB" :showDo="true"
            @handleSelectionChange="userSummaryChange" :tableSelection="0"></com-user-summary>
        </el-col>
      </el-row>
      <el-row class="board-trans">
        <el-col :span="12">
          <com-trans-history :height="700" :searchParam="searchParam" @init="initChartD"></com-trans-history>
        </el-col>
        <el-col :span="12">
          <div class="board-echats-box">
            <div ref="chartD" class="chart"></div>
          </div>
          <div class="board-echats-box">
            <div ref="chartE" class="chart"></div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import * as echarts from 'echarts'
import { commMixin } from '@/utils/commMixin'
import ComUserSummary from '../components/ComUserSummary.vue'
import ComTransHistory from '../components/ComTransHistory.vue'
import AccountRiskControl from '@/components/AccountRiskControl.vue';
import * as util from "@/utils/util";
import { pageMixin } from '@/utils/pageMixin'
import api from '@/api/Statistic.js';
export default {
  mixins: [commMixin, pageMixin],
  components: {
    ComUserSummary,
    ComTransHistory,
    AccountRiskControl
  },
  data() {
    return {
      eChartA: null,
      initChartDataA: [],
      eChartRadioA: 0,
      eChartB: null,
      userSummarys: [],
      eChartC: null,
      eChartD: null,
      eChartE: null,
      userSummaryH: 0,
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }],
        disabledDate(time) {
          return time.getTime() > Date.now();
        }
      },
      searchParam: {
        date: ["", ""],
        userIds: []
      },
      products: [],
      productGroups: {},
      channelId: "",
      switchValue: false,
      child: false,
      myChart: {}
    }
  },
created() {
    console.log("dashboard加载")
      // 获取 apiUrl
  const environment = this.$store.state.selectedEnvironment;
   console.log("dashboard加载de environment")

  console.log(environment)
  if (environment === 'isSimulation') {
  Vue.prototype.$apiUrl = 'https://simapi.quants.top';
  Vue.prototype.$wsUrl = 'wss://simapi.quants.top/websocket';
  Vue.prototype.$appType = '模拟';
} else if (environment === 'isTesting') {
  Vue.prototype.$apiUrl = 'https://apitest.quants.top';
  Vue.prototype.$wsUrl = 'wss://apitest.quants.top/websocket';
  Vue.prototype.$appType = '测试';
} else if (environment === 'isUAT') {
  Vue.prototype.$apiUrl = 'https://apiuat.quants.top';
  Vue.prototype.$wsUrl = 'wss://apiuat.quants.top/websocket';
  Vue.prototype.$appType = 'UAT';
}
  console.log("当前 dashboard加载的 apiUrl:", environment);

  api.getChannels().then(channels => {
  console.log("channel123", channels);
  // 使用从API获取的值来构建 products 数组
this.products = channels.value.map((item, index) => ({
  id: item.id,
  name: item.qtName
}));
this.productGroups = this.products[0].id; // 默认选中第一项的 ID
}).catch(error => {
  console.error("Error fetching channels:", error);
});
},
  watch: {
    // eChartRadioA: {
    //   immediate: true, // 将立即以表达式的当前值触发回调
    //   handler: function (val, oldVal) {
    //     this.initChartA(this.initChartDataA)
    //   },
    //   deep: true,
    // },
     // 监听 productGroups 的变化
     switchValue(newValue) {
      console.log("按键切换", newValue);
      this.applyDateRange();
    },
     productGroups(newVal) {
      // 根据新的选中值获取对应的产品信息
      const selectedProduct = this.products.find(
        (product) => product.id === newVal
      );

      // 输出选中的产品ID和名称
      console.log("选中的产品ID:", selectedProduct.id);
      console.log("选中的产品名称:", selectedProduct.name);
console.log("选中项", selectedProduct);
      this.channelId = selectedProduct.id;
      this.applyDateRange();
      console.log("channelId====", this.channelId);
    }
  },
  methods: {
// 初始化盈亏比/胜率
initChart(winRateData, profitLossData, smoothLine) {
      console.log("胜率数据111:", winRateData);
      console.log("盈亏比数据222:", profitLossData);

      // X轴交易员姓名
      let traderNames = winRateData.map((d) => d.index);

      // 胜率数据（转换为百分比）
      let winRates = winRateData.map((d) => d.shenglv * 100);

      // 盈亏比数据
      let profitLossRatios = profitLossData.map((d) => d.yingkuibi);

      // 盈亏值数据
      let profits = profitLossData.map((d) => d.ying); // 盈
      let losses = profitLossData.map((d) => d.kui); // 亏

      // 胜、平、败数据
      let wins = winRateData.map((d) => d.sheng);
      let draws = winRateData.map((d) => d.ping);
      let fails = winRateData.map((d) => d.bai);

      console.log("输出myChart", this.myChart)
      // 清空现有配置
      this.myChart.clear();

      let option = {
        title: { text: "交易胜率 & 盈亏比", left: "center" },
        tooltip: {
          trigger: "axis",
          formatter: function (params) {
            let index = params[0].dataIndex;
            let trader = params[0].axisValue;
            let win = wins[index];
            let draw = draws[index];
            let fail = fails[index];
            let winRate = winRates[index];
            let profitLossRatio = profitLossRatios[index];
            let profit = profits[index];
            let loss = losses[index];

            return `
                    <b>${trader}</b><br/>
                    胜: ${win} 场 | 平: ${draw} 场 | 败: ${fail} 场<br/>
                    胜率: ${winRate.toFixed(2)}%<br/>
                    盈亏比: ${profitLossRatio.toFixed(2)}<br/>
                    盈: ${profit} | 亏: ${loss}
                `;
          },
        },
        legend: {
          data: ["胜率(%)", "盈亏比", "盈", "亏"],
          top: "12%",
          zIndex: 100,
        },
        grid: {
          left: "15%",
          right: "15%",
          bottom: "15%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: traderNames,
          axisLabel: {
            interval: 0,
            fontSize: 12,
          },
        },
        yAxis: [
          {
            type: "value",
            name: "胜率 (%) / 盈亏值",
            min: 0,
            max: 100,
            axisLabel: { formatter: "{value} %" },
          },
          {
            type: "value",
            name: "盈亏比",
            min: 0,
            axisLabel: { formatter: "{value}" },
          },
        ],
        series: [
          {
            name: "胜率(%)",
            type: "bar",
            yAxisIndex: 0,
            data: winRates,
            color: "#2196F3",
            barWidth: "20%",
            label: { show: true, position: "top", formatter: "{c}%" },
          },
          {
            name: "盈",
            type: "bar",
            yAxisIndex: 0,
            data: profits,
            color: "#4CAF50",
            barWidth: "20%",
            label: { show: true, position: "top" },
          },
          {
            name: "亏",
            type: "bar",
            yAxisIndex: 0,
            data: losses,
            color: "#F44336",
            barWidth: "20%",
            label: { show: true, position: "top" },
          },
          {
            name: "盈亏比",
            type: "line",
            yAxisIndex: 1,
            data: profitLossRatios,
            color: "#FF9800",
            lineStyle: { width: 3 },
            symbol: "circle",
            symbolSize: 8,
            smooth: smoothLine,
            label: { show: true, position: "top" },
          },
        ],
      };

      this.myChart.setOption(option);
    },
    async applyDateRange() {
      console.log("输出搜索参数", this.searchParam)
      const dates = this.searchParam.date || [];

const [startDate, endDate] = dates.map(date => {
  if (typeof date === "string") {
    return date.split("T")[0]; // 如果是字符串，直接格式化
  } else if (date instanceof Date) {
    return date.toISOString().split("T")[0]; // 如果是 Date 对象，转换为 ISO 格式后再处理
  } else {
    return ""; // 处理空值
  }
});
console.log("applyDateRange---输出channel", this.channelId)
console.log("StartDay:", startDate);
console.log("EndDay:", endDate);
console.log("ProductGroups", this.productGroups);
      // 提取并格式化日期
// const [startDate, endDate] = this.searchParam.date.map(date => date.split("T")[0]);
// console.log("StartDay", startDate);
// console.log("EndDay", endDate);

      try {
        console.log("是否切换", this.switchValue);
        console.log("你好呀");
        console.log("开始日期:", startDate);
        console.log("结束日期:", endDate);

        // 直接修改 searchParam.date，不重新赋值整个对象
        // this.searchParam.date = [startDate, endDate];
        console.log("applyDateRange222", this.searchParam);
        // 根据 switchValue 改变 weidu 的值
        const weiduValue = this.switchValue ? "channel" : "person";
        // 定义请求参数
        const params = {
          endDate: endDate,
          startDate: startDate,
          weidu: weiduValue,
          userIds: this.searchParam.userIds,
          channelIds: Array.isArray(this.channelId) ? this.channelId : [this.channelId],
        };
        console.log("输出params", params);

        if (
          weiduValue === "person" &&
          (!this.searchParam.userIds || this.searchParam.userIds.length === 0)
        ) {
          console.warn("交易员为空");
      //     this.$message({
      //   message: "请至少选择一名交易员",
      //   type: "warning",
      // });
          return;
        }
        // 使用 await 获取请求结果，改为异步调用
        const [winRateResponse, profitLossResponse] = await Promise.all([
          api.getWindRate(params), // 请求胜率数据
          api.getYingKui1(params), // 请求盈亏比数据
        ]);
        console.log("胜率数据:", winRateResponse);
        console.log("盈亏比数据:", profitLossResponse);

        if (
          winRateResponse.code === "00000" &&
          profitLossResponse.code === "00000"
        ) {
          console.log("返回的都是00000");
          console.log("winRateResponse", winRateResponse);
          console.log("profitLossResponse", profitLossResponse);
          this.initChart(winRateResponse.value, profitLossResponse.value, true);
        } else {
          console.error(
            "API 返回错误:",
            winRateResponse.code,
            profitLossResponse.code
          );
        }
      } catch (error) {
        console.error("获取数据失败:", error);
      }
    },
    userSummaryChange(rows) {
      // this.initChartB
      console.log("userSummaryChange", rows)
      const userIds = rows.map(n => n.userId);
      if (JSON.stringify(this.searchParam.userIds) !== JSON.stringify(userIds)) {
        this.searchParam.userIds = rows.map(n => n.userId)
      }

      this.applyDateRange();
    },
    initChartA(data) {
      this.initChartDataA = data;
      const option = {
        title: {
          text: '债券交易明细统计',
          subtext: '债券交易量统计',
          x: 'left'
        },
        tooltip: {
          trigger: 'item',
          formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        toolbox: {
          show: false,
          feature: {
            mark: { show: true },
            dataView: { show: true, readOnly: false },
            magicType: {
              show: true,
              type: ['pie', 'funnel'],
              option: {
                funnel: {
                  x: '25%',
                  width: '50%',
                  funnelAlign: 'left',
                  max: 1548
                }
              }
            },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        calculable: true,
        series: [
          {
            name: '交易总量',
            type: 'pie',
            radius: '55%',
            center: ['50%', '50%'],
            data: [],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };

      if (data.length <= 0) return
      const groupByTsCode = util.groupArrayToMap(data, item => item.tscode, item => item)
      let seriesData = [];
      Array.from(groupByTsCode.entries()).forEach(([key, value]) => {
        if (this.eChartRadioA === 0) {
          const res = {
            value: value.reduce((sum, item) => {
              return sum + parseFloat(item.volume || 0)
            }, 0),
            name: key
          };
          seriesData.push(res)
        } else {
          const res = { value: value.length, name: key };
          seriesData.push(res)
        }
      })
      option.series[0].data = seriesData
      const chartDom = this.$refs.chartA
      if (chartDom) {
        this.eChartA = echarts.init(chartDom, null, { width: 'auto' })
        option && this.eChartA.setOption(option, true)
      }
    },
    initChartB(data) {
      this.userSummarys = data;
      let option = {
        title: {
          x: 'center',
          text: '用户交易明细汇总',
        },
        tooltip: {
          trigger: 'axis'
        },
        toolbox: {
          show: false,
          feature: {
            dataView: { show: true, readOnly: false },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        calculable: true,
        grid: {
          borderWidth: 0,
          y: 80,
          y2: 60,
          x: 70
        },
        xAxis: [
          {
            type: 'category',
            show: false,
            data: []
          }
        ],
        yAxis: [
          {
            type: 'value',
            show: false
          },
          {
            type: 'value',
            name: '总盈亏/万',
            position: 'left',
            axisLabel: {
              formatter: '{value}.0000'
            }
          }
        ],
        series: [
          {
            name: '用户交易',
            type: 'bar',
            itemStyle: {
              normal: {
                color: function (params) {
                  // build a color map as your need.
                  // var colorList = [
                  //   '#C1232B', '#B5C334', '#FCCE10', '#E87C25', '#27727B',
                  //   '#FE8463', '#9BCA63', '#FAD860', '#F3A43B', '#60C0DD',
                  //   '#D7504B', '#C6E579', '#F4E001', '#F0805A', '#26C0C0'
                  // ];
                  // const index = params.dataIndex >= colorList.length ? (params.dataIndex - colorList.length) : params.dataIndex
                  return '#009688'
                },
                label: {
                  show: true,
                  position: 'top',
                  formatter: '{b}'
                }
              }
            },
            data: [],
          },
          {
            name: '盈亏/万',
            type: 'line',
            yAxisIndex: 1,
            smooth: true,
            // 设置数据点颜色为红色
            itemStyle: {
              color: 'red'
            },
            data: [],
          }
        ]
      };
      const optionData = data ? data.filter((n, i) => {
        return (n.limitBid + n.limitOffer) > 0;
      }) : []

      option.xAxis[0].data = optionData ? optionData.map((n, i) => {
        return n.nickName
      }) : []

      option.series[0].data = optionData ? optionData.map((n, i) => {
        return (n.limitBid + n.limitOffer)
      }) : []

      const series1 = optionData ? optionData.map((n, i) => {
        return n.solidProfit
      }) : []
      option.series[1].data = series1.map(n => parseFloat(n.replace(/,/g, '')))
      // option.series[0].markPoint.data = data ? data.map((n, i) => {
      //   return { xAxis: i, y: 350, name: n.nickName, symbolSize: 20 }
      // }) : []
      const chartDom = this.$refs.chartB
      if (chartDom) {
        this.eChartB = echarts.init(chartDom, null, { width: 'auto' })
        option && this.eChartB.setOption(option, true)
      }
    },
    initChartC() {
      const option = {
        title: {
          x: 'left',
          text: '产品收益明细',
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          x: 'right',
          data: ['权益一号', '权益二号']
        },
        toolbox: {
          show: false,
          feature: {
            mark: { show: true },
            dataView: { show: true, readOnly: false },
            magicType: { show: true, type: ['line', 'bar', 'stack', 'tiled'] },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        grid: {
          borderWidth: 0,
          y: 80,
          y2: 60,
          x: 70
        },
        calculable: true,
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '资金池/万',
            position: 'left',
            axisLabel: {
              formatter: '{value}'
            },
            max: 101000,
            min: 99900,
          },

        ],
        series: [
          {
            name: '权益一号',
            type: 'line',
            stack: '权益一号',
            smooth: true,
            data: [100000, 100720, 100050, 100100, 100620, 100520, 100120]
          },
          {
            name: '权益二号',
            type: 'line',
            stack: '权益二号',
            smooth: true,
            data: [100100, 99989, 100020, 100120, 100620, 100920, 100720]
          }
        ]
      };
      const chartDom = this.$refs.chartC
      if (chartDom) {
        this.eChartC = echarts.init(chartDom, null, { width: 'auto' })
        this.eChartC.setOption(option, true)
      }
    },
    initChartD(data) {
      const option = {
        title: {
          x: 'left',
          text: '平仓收益走势图',
        },
        tooltip: {
          trigger: 'axis'
        },
        toolbox: {
          show: false,
          feature: {
            mark: { show: true },
            dataView: { show: true, readOnly: false },
            magicType: { show: true, type: ['line', 'bar', 'stack', 'tiled'] },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        calculable: true,
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: []
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '盈亏额/万',
            position: 'left',
            axisLabel: {
              formatter: '{value}.0000'
            },
          },
        ],
        series: []
      };

      let xAxisData = [];
      let seriesData = [];

      if (this.searchParam.userIds.length > 0 && this.searchParam.userIds.length <= 6) {
        data.forEach(n => {
          n.date = util.dateFormat(n.createTime, "YYYY-MM-DD")
        })
        xAxisData = util.getDatesInRange(this.searchParam.date[0], this.searchParam.date[1], "YYYY-MM-DD");
        // xAxisData = [...new Set(data.map(n => n.date))];
        // xAxisData.sort(function (a, b) {
        //   return a < b ? -1 : 1
        // })
        const groupByUser = util.groupArrayToMap(data, item => item.yanjiuyuanId, item => item)
        Array.from(groupByUser.entries()).forEach(([key, value]) => {
          let seriesData1 = [];
          const groupByDate = util.groupArrayToMap(value, item => item.date, item => parseFloat(item.profit || 0))
          xAxisData.forEach(n => {
            let val = groupByDate.get(n)
            if (val && val.length > 0) {
              const sum = val.reduce((sum, item) => {
                return sum + parseFloat(item || 0) * 10000
              }, 0) / 10000
              seriesData1.push((seriesData1.length > 0 ? seriesData1[seriesData1.length - 1] : 0) + (sum || 0))
            } else {
              seriesData1.push((seriesData1.length > 0 ? seriesData1[seriesData1.length - 1] : 0) + 0)
            }
          })

          // value.forEach(n => {
          //   seriesData1.push(util.moneyFormat(parseFloat(seriesData1.length > 0 ? seriesData1[seriesData1.length - 1] : 0) + parseFloat(n.profit || 0), 4))
          // })
          seriesData1 = seriesData1.map(n => n.toFixed(4))
          const user = this.userSummarys.filter(n => n.userId === key);
          let series = {
            name: user[0].nickName + ': 截至盈亏',
            type: 'line',
            // stack: '总量',
            yAxisIndex: 0,
            symbol: 'none',
            smooth: true,
            data: seriesData1
          }
          option.series.push(series)
          // console.log(key, series)
        })
      } else {
        data.forEach(n => {
          n.date = util.dateFormat(n.createTime, "YYYY-MM-DD")
        })
        xAxisData = util.getDatesInRange(this.searchParam.date[0], this.searchParam.date[1], "YYYY-MM-DD");
        const groupByDate = util.groupArrayToMap(data, item => item.date, item => parseFloat(item.profit || 0))
        xAxisData.forEach(n => {
          let val = groupByDate.get(n)
          if (val && val.length > 0) {
            const sum = val.reduce((sum, item) => {
              return sum + parseFloat(item || 0) * 10000
            }, 0) / 10000
            seriesData.push((seriesData.length > 0 ? seriesData[seriesData.length - 1] : 0) + (sum || 0))
          } else {
            seriesData.push((seriesData.length > 0 ? seriesData[seriesData.length - 1] : 0) + 0)
          }
        })
        const seriesDatas = seriesData.map(n => n.toFixed(4))
        option.series.push({
          name: '截至盈亏',
          type: 'line',
          // stack: '总量',
          yAxisIndex: 0,
          symbol: 'none',
          smooth: true,
          data: seriesDatas
        })
      }

      option.xAxis[0].data = xAxisData
      const chartDomD = this.$refs.chartD
      if (chartDomD) {
        this.eChartD = echarts.init(chartDomD, null, { width: 'auto' })
        this.eChartD.setOption(option, true)
      }

      //
      let optionSec = {
        title: {
          x: 'left',
          text: '平仓品种收益',
        },
        tooltip: {
          trigger: 'axis'
        },
        toolbox: {
          show: false,
          feature: {
            mark: { show: true },
            dataView: { show: true, readOnly: false },
            magicType: { show: true, type: ['line', 'bar', 'stack', 'tiled'] },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        xAxis: [{
          type: 'category',
          data: []
        }],
        yAxis: [{
          type: 'value',
          name: '总盈亏/万',
          position: 'left',
          axisLabel: {
            formatter: '{value}.0000'
          }
        }],
        series: [{
          name: '当前盈亏',
          data: [],
          type: 'bar',
          itemStyle: {
            normal: {
              label: {
                show: true,
                position: 'top',
                formatter: '{b}'
              }
            }
          },
          barWidth: '60%',
        }]
      };

      xAxisData = [];
      seriesData = [];
      const groupByTscode = util.groupArrayToMap(data, item => item.tscode, item => item)
      Array.from(groupByTscode.entries()).forEach(([key, value]) => {
        xAxisData.push(key)
        const sum = util.moneyFormat(value.reduce((sum, item) => {
          return sum + parseFloat(item.profit || 0) * 10000
        }, 0) / 10000, 4)
        seriesData.push({ value: sum, itemStyle: { color: sum > 0 ? 'green' : 'red' } })
      })
      optionSec.xAxis[0].data = xAxisData
      optionSec.series[0].data = seriesData
      const chartDomE = this.$refs.chartE
      if (chartDomE) {
        this.eChartE = echarts.init(chartDomE, null, { width: 'auto' })
        this.eChartE.setOption(optionSec, true);
      }
      this.initChartA(data)
      // if (this.setAuth('system:alltrans:query')) {
      //   this.initChartA(data)
      // }
    },
  },

  mounted() {
    if (window.v1) {
      Promise.all([]).then(async () => {
        const response = await window.v1.getWinThis();
        this.child = response.data && response.data.child
      })
    }
    setTimeout(() => {
      this.initChartC()
      // this.initChartD()
    }, 300)
    const end = new Date();
    const start = new Date();
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
    this.searchParam.date = [start, end]
    this.initFrameH('userSummaryH', 300)
    // this.$winResize(() => {
    //   this.eChartA && this.eChartA.resize()
    //   this.eChartB && this.eChartB.resize()
    //   this.eChartC && this.eChartC.resize()
    //   this.eChartD && this.eChartD.resize()
    //   this.eChartE && this.eChartE.resize()
    //   this.initFrameH('userSummaryH', 700)
    // })
    this.myChart = echarts.init(this.$refs['main-chart']);
     // 窗口大小变化时触发
  this.$winResize(() => {
    // 调整图表大小
    this.myChart.resize();
console.log("窗口改变大小");
    // 调整其他布局的高度（如果有）
    this.initFrameH('userSummaryH', 700);
  });
  //   setTimeout(() => {
  //   this.applyDateRange();
  // }, 2000);
  },
}
</script>

<style lang="scss" scoped>
@import "@/assets/css/style.scss";

.content {
  height: 100%;
  background-color: #000;

  .board-header {
    .do {
      margin: 10px;
      // margin-top: 10px;
      height: 50px;
      line-height: 50px;
      background-color: #fff;
      border-radius: 3px;
      padding: 0 10px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
    }
  }

  .board-echats {
    margin-left: 10px;
    margin-right: 10px;
    .board-echats-box {
      height: 350px;
      background: white;
      border-radius: 3px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
      margin: 0px 10px;
      position: relative;

      .chartA-btn {
        position: absolute;
        top: 10px;
        right: 10px;
      }
    }
  }

  .board-user {

    .board-user-box {
      width: 100%;
      height: calc(100vh - 440px);
      background: white;
      border-radius: 3px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
      margin: 10px;
      padding: 5px;
    }
  }

  .board-trans {
    padding: 0px 0;

    .board-echats-box {
      height: 350px;
      background: white;
      border-radius: 3px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
      margin: 0 10px 10px 0;
    }
  }

  .chart {
    height: 340px;
    width: calc(100% - 20px);
    padding: 10px 10px 0 10px;
    border-radius: 3px;

  }
}
</style>
