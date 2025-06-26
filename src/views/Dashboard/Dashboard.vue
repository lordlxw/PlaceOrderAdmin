<template>
  <div class="content">
    <title-bar v-if="child"> </title-bar>
    <div class="content custom-scrollbar">
      <el-row class="board-header">
        <el-col :span="24">
          <div class="do">
            <el-row>
              <el-col :span="12">
                <el-radio-group
                  v-model="productGroups"
                  size="small"
                  v-if="setAuth('system:alltrans:query')"
                >
                  <el-radio-button
                    v-for="product in products"
                    :label="product.id"
                    :key="product.id"
                    >{{ product.name }}</el-radio-button
                  >
                </el-radio-group>
              </el-col>
              <el-col
                :span="setAuth('system:alltrans:query') ? 12 : 24"
                class="text-right"
              >
                <el-date-picker
                  v-model="searchParam.date"
                  type="daterange"
                  align="right"
                  unlink-panels
                  :clearable="false"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="yyyy-MM-dd"
                  :picker-options="pickerOptions"
                  style="font-size: 16px; font-weight: bold; height: 40px; width: 300px;"
                  popper-class="custom-date-picker"
                >
                </el-date-picker>
              </el-col>
            </el-row>
          </div>
        </el-col>
      </el-row>
      <el-row class="board-echats">
        <el-col :span="24" style="background-color: #f0f0f0; padding: 20px;">
          <!-- 上方：切换 + 单选按钮在一行 -->
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <!-- 左侧：切换 -->
            <div style="flex: 0 0 auto;">
              <el-switch
                v-model="switchValue"
                size="large"
                active-text="通道"
                inactive-text="个人"
                style="font-size: 20px;"
              />
            </div>

            <!-- 中间撑开并居中：用 position:absolute + relative 方法 -->
            <div style="position: relative; flex-grow: 1; text-align: center;">
              <el-radio-group
                v-model="activeTabs"
                @change="handleTabsChange"
                size="large"
              >
                <el-radio-button label="performance">交易表现</el-radio-button>
                <el-radio-button label="capital">资金情况</el-radio-button>
                <el-radio-button label="returns">收益表现</el-radio-button>
              </el-radio-group>
            </div>

            <!-- 右侧占位（空） -->
            <div style="flex: 0 0 auto; width: 60px;">
              <!-- 可以加搜索按钮啥的 -->
            </div>
          </div>

          <!-- 主图表 -->
          <div ref="mainChart" style="width: 100%; height: 400px;"></div>

          <!-- 下方：展开按钮 + 表格（新增） -->
          <div
            style="max-height: 470px; overflow: auto; margin-top: -40px; position: relative; z-index: 1;"
          >
            <el-button @click="showTable = !showTable" type="primary" plain>
              {{ showTable ? "收起表格" : "展开数据表格" }}
            </el-button>

            <el-table
              v-show="showTable"
              :data="tableData"
              :row-style="rowStyle"
              @row-click="selectRow"
              style="width: 100%; margin-top: 10px;margin-left: -3px;"
              border
              stripe
              header-cell-class-name="table-header"
              cell-class-name="table-cell"
              highlight-current-row
            >
              <el-table-column prop="name" label="用户" width="60" />
              <el-table-column prop="shenglv" label="胜率" width="70" />
              <el-table-column prop="shengfuping" label="胜平负场数" />
              <el-table-column
                prop="yingKuiBi1"
                label="盈亏比1"
                min-width="100"
              >
                <template #default="{ row }">
                  <div v-html="row.yingKuiBi1"></div>
                </template>
              </el-table-column>
              <el-table-column
                prop="yingKuiBi2"
                label="盈亏比2"
                min-width="100"
              >
                <template #default="{ row }">
                  <div v-html="row.yingKuiBi2"></div>
                </template>
              </el-table-column>
              <el-table-column prop="initialProfit" label="期初盈亏" />
              <el-table-column prop="dayMaxProfit" label="最大日盈">
                <template #default="{ row }">
                  <div v-html="row.dayMaxProfit"></div>
                </template>
              </el-table-column>
              <el-table-column prop="dayMaxBack" label="最大日回撤">
                <template #default="{ row }">
                  <div v-html="row.dayMaxBack"></div>
                </template>
              </el-table-column>
              <el-table-column prop="maxProfit" label="单笔最大利润">
                <template #default="{ row }">
                  <div v-html="row.maxProfit"></div>
                </template>
              </el-table-column>
              <el-table-column prop="minProfit" label="单笔最大亏损">
                <template #default="{ row }">
                  <div v-html="row.minProfit"></div>
                </template>
              </el-table-column>
              <el-table-column
                prop="rangeEarningRate"
                label="区间收益"
                min-width="135"
              >
                <template #default="{ row }">
                  <div v-html="row.rangeEarningRate"></div>
                </template>
              </el-table-column>
              <el-table-column label="区间盈亏" prop="rangeProfit">
                <template #default="{ row }">
                  <span :style="{ color: getProfitColor(row.rangeProfit) }">
                    {{ row.rangeProfit }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                prop="yearEarningRate"
                label="年化收益"
                min-width="125"
              >
                <template #default="{ row }">
                  <div v-html="row.yearEarningRate"></div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
      </el-row>

      <el-row class="board-user">
        <el-col :span="24">
          <com-user-summary
            :height="310"
            :searchParam="searchParam"
            @init="initChartB"
            :showDo="true"
            @handleSelectionChange="userSummaryChange"
            :tableSelection="0"
          ></com-user-summary>
        </el-col>
      </el-row>
      <el-row class="board-trans">
        <el-col :span="12">
          <com-trans-history
            :height="700"
            :searchParam="searchParam"
            @init="initChartD"
          ></com-trans-history>
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
import Vue from "vue";
import * as echarts from "echarts";
import { commMixin } from "@/utils/commMixin";
import ComUserSummary from "../components/ComUserSummary.vue";
import ComTransHistory from "../components/ComTransHistory.vue";
import AccountRiskControl from "@/components/AccountRiskControl.vue";
import * as util from "@/utils/util";
import { pageMixin } from "@/utils/pageMixin";
import api from "@/api/Statistic.js";
import { debounce } from "@/utils/debounce";
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
        shortcuts: [
          {
            text: "最近一周",

            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            }
          }
        ],
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
      channelIds: [],
      switchValue: false,
      child: false,
      myChart: {},
      activeTabs: "performance", // 默认选中 "交易表现"，也可以改为空 []
      currentChartConfig: "tradingPerformance",
      ApiParams: {}, // 示例，获取"交易表现"配置
      // 你的其他 data 属性...
      loadChartDataCallCount: 0, // 新增一个计数器
      showTable: true, // 默认展开
      tableData: []
    };
  },
  created() {
    console.log("dashboard加载");
    // 获取 apiUrl
    const environment = this.$store.state.selectedEnvironment;
    console.log("dashboard加载de environment");

    console.log(environment);
    if (environment === "isSimulation") {
      Vue.prototype.$apiUrl = "https://simapi.quants.top";
      Vue.prototype.$wsUrl = "wss://simapi.quants.top/websocket";
      Vue.prototype.$appType = "模拟";
    } else if (environment === "isTesting") {
      Vue.prototype.$apiUrl = "https://apitest.quants.top";
      Vue.prototype.$wsUrl = "wss://apitest.quants.top/websocket";
      Vue.prototype.$appType = "测试";
    } else if (environment === "isUAT") {
      Vue.prototype.$apiUrl = "https://apiuat.quants.top";
      Vue.prototype.$wsUrl = "wss://apiuat.quants.top/websocket";
      Vue.prototype.$appType = "UAT";
    }
    console.log("当前 dashboard加载的 apiUrl:", environment);

    api
      .getChannels()
      .then(channels => {
        console.log("channel123", channels);
        // 使用从API获取的值来构建 products 数组
        this.products = channels.value.map((item, index) => ({
          id: item.id,
          name: item.qtName
        }));
        this.productGroups = this.products[0].id; // 默认选中第一项的 ID
        this.channelIds = channels.value.map(item => item.id);
        console.log("channelIds", this.channelIds);
      })
      .catch(error => {
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
        product => product.id === newVal
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
    // 选中行并执行方法
    selectRow(row, column, event) {
      console.log("selectRow");
      this.name = row.name;
    },
    // 设置选中行的背景色
    rowStyle({ row }) {
      if (this.name === row.name) {
        return {
          "background-color": "#d2b48c", // 土黄色
          cursor: "pointer"
        };
      }
      return { cursor: "pointer" };
    },

    getProfitColor(value) {
      // 提取数值部分（忽略"万"）
      const num = parseFloat(value);
      if (isNaN(num)) return "#000"; // 默认黑色
      if (num > 0) return "green";
      if (num < 0) return "red";
      return "#000";
    },
    // 传递配置和请求参数，改进后的 initChart 方法
    initChart2({ title, xAxisData, seriesList, legendList, yAxisConfig }) {
      // 清空现有配置
      this.myChart.clear();
      let option = {
        title: { text: title, left: "center" },
        tooltip: {
          trigger: "axis",
          extraCssText: 'line-height: 2; font-size: 14px;',
          formatter: function(params) {
            let result = '';
            if (Array.isArray(params)) {
              result += params[0].axisValueLabel || params[0].name || '';
              result += '<br/>';
              params.forEach(item => {
                let val = item.value;
                let showVal = val;
                if (typeof val === 'number' && isFinite(val)) {
                  if (item.seriesName && item.seriesName.indexOf('胜率') !== -1) {
                    showVal = val.toFixed(2) + '%';
                  } else {
                    showVal = val.toFixed(2) + ' 万';
                  }
                } else if (val && typeof val.value === 'number' && isFinite(val.value)) {
                  if (item.seriesName && item.seriesName.indexOf('胜率') !== -1) {
                    showVal = val.value.toFixed(2) + '%';
                  } else {
                    showVal = val.value.toFixed(2) + ' 万';
                  }
                } else if (typeof val === 'string') {
                  showVal = val;
                } else if (val && typeof val.value === 'string') {
                  showVal = val.value;
                }
                result += `${item.marker} ${item.seriesName}: ${showVal}`;
                result += '<br/>';
              });
            }
            return result;
          }
        },
        legend: {
          data: legendList,
          top: "7%",
          zIndex: 100
        },
        grid: {
          left: "15%",
          right: "15%",
          bottom: "15%",
          containLabel: true
        },
        xAxis: {
          type: "category",
          data: xAxisData,
          axisLabel: {
            interval: 0,
            fontSize: 12
          }
        },
        yAxis: yAxisConfig,
        series: seriesList.map(ser => {
          // 只处理有label的series
          if (ser.label && ser.label.show) {
            return {
              ...ser,
              label: {
                ...ser.label,
                formatter: function(value) {
                  let v = value.value;
                  if (typeof v === 'number') {
                    v = v.toFixed(2);
                  } else if (v && typeof v.value === 'number') {
                    v = v.value.toFixed(2);
                  }
                  // 保留原有单位
                  if (ser.name && ser.name.indexOf('胜率') !== -1) {
                    return v + '%';
                  }
                  return v + '万';
                }
              }
            };
          }
          return ser;
        })
      };

      this.myChart.setOption(option);
    },

    // 通用方法，加载图表,目前是只按三块加载
    async loadChartData() {
      console.log("当前传参：", this.ApiParams);
      this.loadChartDataCallCount += 1; // 每次调用就加1
      console.log(`loadChartData 调用次数：${this.loadChartDataCallCount}`);
      // 使用 this.currentChartConfig 配置加载图表
      if (this.currentChartConfig === "tradingPerformance") {
        try {
          const [
            windRateRes,
            yingKui1Res,
            yingKui2Res,
            maxProfitTradeRes,
            dailyMaxProfitRes
          ] = await Promise.all([
            api.getWindRate(this.ApiParams),
            api.getYingKui1(this.ApiParams),
            api.getYingKui2(this.ApiParams),
            api.getMaxProfitByTrade(this.ApiParams),
            api.getDailyMaxProfitAndDrawdown(this.ApiParams)
          ]);

          // 获取数据
          const winRateData = windRateRes.value || [];
          const yingKui1Data = yingKui1Res.value || [];
          const yingKui2Data = yingKui2Res.value || [];
          const maxProfitTradeData = maxProfitTradeRes.value || [];
          const dailyMaxProfitData = dailyMaxProfitRes.value || [];

          // 提取交易者名字、胜率等数据
          const traderNames = winRateData.map(d => d.index);
          const winRates = winRateData.map(d => d.shenglv * 100);
          const profitLossRatio1 = yingKui1Data.map(d => d.yingkuibi);
          const profitLossRatio2 = yingKui2Data.map(d => d.yingkuibi);
          const maxProfitPerTrade = maxProfitTradeData.map(d => d.maxprofit);
          const maxLossPerTrade = maxProfitTradeData.map(d => d.minprofit);
          const dailyMaxProfit = dailyMaxProfitData.map(d => d.maxSolidprofit);
          const dailyMaxDrawdown = dailyMaxProfitData.map(d => d.maxSolidback);

          // 获取最大盈利、最大亏损及发生时间
          const maxProfitTimes = maxProfitTradeData.map(d => d.tradeTime);
          const maxLossTimes = maxProfitTradeData.map(d => d.tradeTime2);

          // 调用封装好的 initChart
          this.initChart2({
            title: "交易表现综合分析",
            xAxisData: traderNames,
            legendList: [
              "胜率(%)",
              "盈亏比1",
              "盈亏比2",
              "单笔最大盈利",
              "单笔最大亏损",
              "单日最大盈利",
              "单日最大回撤"
            ],
            yAxisConfig: [
              {
                type: "value",
                name: "胜率 (%)",
                min: 0,
                max: 100,
                axisLabel: {
                  formatter: function(value) {
                    return value.toFixed(2) + " %";
                  }
                }
              },
              {
                type: "value",
                name: "盈亏比 / 金额 (万)",
                min: 0,
                axisLabel: {
                  formatter: value => `${value}万`
                }
              }
            ],
            seriesList: [
              {
                name: "胜率(%)",
                type: "bar",
                yAxisIndex: 0,
                data: winRates,
                label: {
                  show: true,
                  position: "top",

                  formatter: function(params) {
                    return params.value.toFixed(2) + "%";
                  }
                }
              },
              {
                name: "盈亏比1",
                type: "line",
                yAxisIndex: 1,
                data: profitLossRatio1
              },
              {
                name: "盈亏比2",
                type: "line",
                yAxisIndex: 1,
                data: profitLossRatio2
              },
              {
                name: "单笔最大盈利",
                type: "bar",
                yAxisIndex: 1,
                data: maxProfitPerTrade,
                label: {
                  show: true,
                  position: "top",
                  formatter: value => `${value.value}万`
                }
              },
              {
                name: "单笔最大亏损",
                type: "bar",
                yAxisIndex: 1,
                data: maxLossPerTrade
              },
              {
                name: "单日最大盈利",
                type: "line",
                yAxisIndex: 1,
                data: dailyMaxProfit
              },
              {
                name: "单日最大回撤",
                type: "line",
                yAxisIndex: 1,
                data: dailyMaxDrawdown
              },
              {
                name: "单笔最大盈利发生时间",
                type: "line",
                yAxisIndex: 1,
                data: maxProfitTimes
              },
              {
                name: "单笔最大盈利",
                type: "scatter",
                yAxisIndex: 1,
                data: maxProfitTimes.map((time, index) => ({
                  value: maxProfitPerTrade[index],
                  time
                }))
              },
              {
                name: "单笔最大亏损发生时间",
                type: "line",
                yAxisIndex: 1,
                data: maxLossTimes
              },
              {
                name: "单笔最大亏损",
                type: "scatter",
                yAxisIndex: 1,
                data: maxLossTimes.map((time, index) => ({
                  value: maxLossPerTrade[index],
                  time
                }))
              }
            ]
          });
        } catch (error) {
          console.error("加载交易表现数据失败", error);
          this.$message({
            message: `加载交易表现数据失败: ${error.message || error}`,
            type: "error"
          });
        }
      } else if (this.currentChartConfig === "fundSituation") {
        try {
          const [initialProfitLossRes, rangeProfitRes] = await Promise.all([
            api.getInitialProfitAndLoss(this.ApiParams),
            api.getRangeProfit(this.ApiParams)
          ]);

          const initialProfitLossData = initialProfitLossRes.value || [];
          const rangeProfitData = rangeProfitRes.value || [];

          console.log("[资金情况] 期初盈亏原始数据:", initialProfitLossData);
          console.log("[资金情况] 区间盈亏原始数据:", rangeProfitData);

          const traderNames = initialProfitLossData.map(d => d.index);
          const initialProfits = initialProfitLossData.map(
            d => Number(d.profit) || 0
          );
          const rangeProfits = rangeProfitData.map(d => Number(d.profit) || 0);

          console.log("[资金情况] 交易员名称列表:", traderNames);
          console.log("[资金情况] 期初盈亏:", initialProfits);
          console.log("[资金情况] 区间盈亏:", rangeProfits);

          this.initChart2({
            title: "资金情况综合分析",
            xAxisData: traderNames,
            legendList: ["期初盈亏", "区间盈亏"],
            yAxisConfig: [
              {
                type: "value",
                name: "金额（万）",
                min: null
              }
            ],
            seriesList: [
              {
                name: "期初盈亏",
                type: "bar",
                yAxisIndex: 0,
                data: initialProfits,
                itemStyle: {
                  color: params => (params.value >= 0 ? "#3CB371" : "#FF6347")
                },
                label: {
                  show: true,
                  position: "top",
                  formatter: value => `${value.value}万`,
                  color: "#000"
                }
              },
              {
                name: "区间盈亏",
                type: "bar",
                yAxisIndex: 0,
                data: rangeProfits,
                itemStyle: {
                  color: params => (params.value >= 0 ? "#3CB371" : "#FF6347")
                },
                label: {
                  show: true,
                  position: "top",
                  formatter: value => `${value.value}万`,
                  color: "#000"
                }
              }
            ]
          });
        } catch (error) {
          console.error("加载资金情况图表失败", error);
          this.$message({
            message: `加载资金情况图表失败: ${error.message || error}`,
            type: "error"
          });
        }
      } else {
        try {
          const [rangeEarningRateRes, yearEarningRateRes] = await Promise.all([
            api.getRangeEarningRate(this.ApiParams),
            api.getYearEarningRate(this.ApiParams)
          ]);

          const rangeEarningRateData = rangeEarningRateRes.value || [];
          const yearEarningRateData = yearEarningRateRes.value || [];

          const traderNames = rangeEarningRateData.map(d => d.index);
          const rangeRates = rangeEarningRateData.map(d => d.earningRate || 0);
          const rangeProfit = rangeEarningRateData.map(d => d.profit || 0);
          const yearRates = yearEarningRateData.map(d => d.earningRate || 0);
          const yearProfit = yearEarningRateData.map(d => d.profit || 0);
          const zongZiJins = rangeEarningRateData.map(d => d.zongzijin || 0);

          console.log("📊 traderNames:", traderNames);
          console.log("📈 rangeRates:", rangeRates);
          console.log("💰 rangeProfit:", rangeProfit);
          console.log("📆 yearRates:", yearRates);
          console.log("📆 yearProfit:", yearProfit);
          console.log("🏦 zongZiJins:", zongZiJins);

          const allProfit = rangeProfit.concat(yearProfit);
          const maxAbsProfit = Math.max(...allProfit.map(v => Math.abs(v)), 10);

          this.initChart2({
            title: "收益表现综合分析",
            xAxisData: traderNames,
            tooltip: {
              trigger: "axis",
              extraCssText: 'line-height: 2; font-size: 14px;',
              formatter: function(params) {
                const index = params[0].dataIndex;
                let content = `👤 交易员: ${traderNames[index]}<br/>`;
                params.forEach(p => {
                  content += `${p.marker} ${p.seriesName}: ${p.value} 万<br/>`;
                });
                content += `🏦 总资金: ${zongZiJins[index]} 万`;
                return content;
              }
            },
            legendList: [
              "区间收益率",
              "区间收益",
              "年化收益率",
              "年化收益",
              "总资金"
            ],
            yAxisConfig: [
              {
                type: "value",
                name: "收益率 (%)",
                min: 0,
                max: 100,
                axisLabel: { formatter: "{value} %" }
              },
              {
                type: "value",
                name: "收益金额(万)",
                min: -maxAbsProfit,
                max: maxAbsProfit,
                axisLabel: { formatter: "{value} 万" }
              },
              {
                type: "value",
                name: "总资金(万)",
                position: "right",
                offset: 60,
                axisLine: {
                  lineStyle: {
                    color: "#4a90e2"
                  }
                },
                axisLabel: {
                  formatter: "{value} 万"
                }
              }
            ],
            seriesList: [
              {
                name: "区间收益率",
                type: "line",
                yAxisIndex: 0,
                data: rangeRates
              },
              {
                name: "区间收益",
                type: "bar",
                yAxisIndex: 1,
                data: rangeProfit,
                label: {
                  show: true,
                  position: "top",
                  formatter: value => `${value.value}万`
                },
                itemStyle: {
                  color: params => (params.value >= 0 ? "#3fb68b" : "#ec5b56")
                }
              },
              {
                name: "年化收益率",
                type: "line",
                yAxisIndex: 0,
                data: yearRates
              },
              {
                name: "年化收益",
                type: "bar",
                yAxisIndex: 1,
                data: yearProfit,
                label: {
                  show: true,
                  position: "top",
                  formatter: value => `${value.value}万`
                },
                itemStyle: {
                  color: params => (params.value >= 0 ? "#3fb68b" : "#ec5b56")
                }
              },
              {
                name: "总资金",
                type: "bar",
                yAxisIndex: 2,
                data: zongZiJins,
                barGap: "30%",
                itemStyle: {
                  color: "#4a90e2"
                },
                label: {
                  show: true,
                  position: "top",
                  formatter: value => `${value.value}万`
                }
              }
            ]
          });
        } catch (error) {
          console.error("加载收益表现数据失败", error);
          this.$message({
            message: `加载收益表现数据失败: ${error.message || error}`,
            type: "warning"
          });
        }
      }

      console.log("测试所有数据");
      try {
        // 延迟 1 秒后执行 loadDataTableAsync
        await new Promise(resolve => setTimeout(resolve, 500));

        await this.loadDataTableAsync();
      } catch (error) {
        console.error("加载数据表格失败", error);
        this.$message({
          message: `加载数据表格失败: ${error.message || error}`,
          type: "error"
        });
      }
    },

    // 加载所有表格数据
    async loadDataTableAsync() {
      try {
        // 并发请求多个接口
        const [
          windRateRes,
          yingKui1Res,
          yingKui2Res,
          maxProfitTradeRes,
          dailyMaxProfitRes,
          initialProfitRes,
          rangeEarningRateRes,
          rangeProfitRes,
          yearEarningRateRes
        ] = await Promise.all([
          api.getWindRate(this.ApiParams),
          api.getYingKui1(this.ApiParams),
          api.getYingKui2(this.ApiParams),
          api.getMaxProfitByTrade(this.ApiParams),
          api.getDailyMaxProfitAndDrawdown(this.ApiParams),
          api.getInitialProfitAndLoss(this.ApiParams),
          api.getRangeEarningRate(this.ApiParams),
          api.getRangeProfit(this.ApiParams),
          api.getYearEarningRate(this.ApiParams)
        ]);

        // 打印每个请求的响应数据
        console.log("风控胜率数据:", windRateRes);
        console.log("盈亏比1数据:", yingKui1Res);
        console.log("盈亏比2数据:", yingKui2Res);
        console.log("期初盈亏数据:", initialProfitRes);
        console.log("单笔最大盈利数据:", maxProfitTradeRes);
        console.log("单日最大盈利数据:", dailyMaxProfitRes);
        console.log("区间收益率数据:", rangeEarningRateRes);
        console.log("区间盈亏数据:", rangeProfitRes);
        console.log("年化收益率数据:", yearEarningRateRes);

        // 如果windRateRes是对象并且包含一个名为value的数组字段
        const windRateData = windRateRes.value || [];
        const yingKuiData1 = yingKui1Res.value || [];
        const yingKuiData2 = yingKui2Res.value || [];
        const initialProfitData = initialProfitRes.value || [];
        const maxProfitTradeData = maxProfitTradeRes.value || [];
        const dailyMaxProfitData = dailyMaxProfitRes.value || [];
        const rangeEarningRateData = rangeEarningRateRes.value || [];
        const rangeProfitData = rangeProfitRes.value || [];
        const yearEarningRateData = yearEarningRateRes.value || [];
        // 先将盈亏比1数据转为 Map，方便按 index 查找
        const yingKuiMap1 = new Map(yingKuiData1.map(d => [d.index, d]));
        const yingKuiMap2 = new Map(yingKuiData2.map(d => [d.index, d]));
        const initialProfitMap = new Map(
          initialProfitData.map(d => [d.index, d])
        );
        const maxProfitTradeMap = new Map(
          maxProfitTradeData.map(d => [d.index, d])
        ); // 单笔的
        const dailyMaxProfitMap = new Map(
          dailyMaxProfitData.map(d => [d.index, d])
        ); // 单日的

        const rangeEarningRateMap = new Map(
          rangeEarningRateData.map(d => [d.index, d])
        ); // 区间收益率数据

        const rangeProfitMap = new Map(rangeProfitData.map(d => [d.index, d])); // 区间收益率数据

        const yearEarningRateMap = new Map(
          yearEarningRateData.map(d => [d.index, d])
        ); // 年化收益数据

        console.log("yingkuiMap1:", yingKuiMap1);
        console.log("yingkuiMap2:", yingKuiMap2);
        console.log("initialProfitMap:", initialProfitMap);
        console.log("maxProfitTradeMap:", maxProfitTradeMap);
        console.log("dailyMaxProfitMap:", dailyMaxProfitMap);
        console.log("rangeEarningRateMap:", rangeEarningRateMap);
        console.log("rangeProfitMap:", rangeProfitMap);
        console.log("yearEarningRateMap:", yearEarningRateMap);
        // 格式化数据为表格格式
        const formattedData = windRateData.map(d => {
          const winRatePercentage = (d.shenglv * 100).toFixed(2); // 胜率的百分比表示
          const winLossDraw = `胜:${d.sheng},平:${d.ping},负:${d.bai}`; // 胜平负场数的表示

          const yingKuiItem1 = yingKuiMap1.get(d.index); // 找到对应的盈亏比1项
          const yingKuiItem2 = yingKuiMap2.get(d.index); // 找到对应的盈亏比2项
          const initialProfitItem = initialProfitMap.get(d.index); // 找到对应的盈亏比2项
          const maxProfitTradeItem = maxProfitTradeMap.get(d.index); // 最大盈亏单
          const dailyMaxProfitItem = dailyMaxProfitMap.get(d.index); // 最大固盈回撤
          const rangeEarningRateItem = rangeEarningRateMap.get(d.index); // 区间收益率
          const rangeProfitItem = rangeProfitMap.get(d.index); // 区间盈亏
          const yearEarningRateItem = yearEarningRateMap.get(d.index); // 年化收益率
          console.log("maxProfitTradeItem:", maxProfitTradeItem);
          console.log("dailyMaxProfitItem:", dailyMaxProfitItem);
          let yingKuiStr1 = "-";
          let yingKuiStr2 = "-";
          let initialProfitStr = "-";
          let maxProfitTradeStr = "-";
          let minProfitTradeStr = "-";
          let dailyMaxTradeStr = "-";
          let dailyMaxBackStr = "-";
          let rangeEarningRateStr = "-";
          let rangeProfitStr = "-";
          let yearEarningRateStr = "-";
          if (yingKuiItem1) {
            const ying = yingKuiItem1.ying.toFixed(2);
            const kui = yingKuiItem1.kui.toFixed(2);
            const ratio = yingKuiItem1.yingkuibi.toFixed(2);
            yingKuiStr1 = `盈:${ying}万，亏:${kui}万<br/>盈亏比1：${ratio}%`;
          }
          if (yingKuiItem2) {
            const ying = yingKuiItem2.ying.toFixed(2);
            const kui = yingKuiItem2.kui.toFixed(2);
            const ratio = yingKuiItem2.yingkuibi.toFixed(2);
            yingKuiStr2 = `盈:${ying}万，亏:${kui}万<br/>盈亏比1：${ratio}%`;
          }

          if (initialProfitItem) {
            const initialProfit = initialProfitItem.profit.toFixed(4);
            initialProfitStr = `${initialProfit}万`;
          }

          if (dailyMaxProfitItem) {
            const maxProfitTrade =
              dailyMaxProfitItem.maxSolidprofit != null
                ? dailyMaxProfitItem.maxSolidprofit.toFixed(2)
                : "-";
            const maxProfitTradeDate = dailyMaxProfitItem.maxSolidprofitTradeDate
              ? dailyMaxProfitItem.maxSolidprofitTradeDate.slice(5)
              : "-";
            dailyMaxTradeStr = `${maxProfitTrade}万<br/>${maxProfitTradeDate}`;

            const maxBackTrade =
              dailyMaxProfitItem.maxSolidback != null
                ? dailyMaxProfitItem.maxSolidback.toFixed(2)
                : "-";
            const maxBackTradeDate = dailyMaxProfitItem.maxSolidbackTradeDate
              ? dailyMaxProfitItem.maxSolidbackTradeDate.slice(5)
              : "-";
            dailyMaxBackStr = `${maxBackTrade}万<br/>${maxBackTradeDate}`;
          }

          if (maxProfitTradeItem) {
            const maxProfit =
              maxProfitTradeItem.maxprofit != null
                ? maxProfitTradeItem.maxprofit.toFixed(2)
                : "-";
            const maxProfitTradeTime = maxProfitTradeItem.tradeTime
              ? maxProfitTradeItem.tradeTime.slice(5) // 去掉前5位，即 "YYYY-"
              : "-";
            maxProfitTradeStr = `${maxProfit}万<br/>${maxProfitTradeTime}`;

            const minProfit =
              maxProfitTradeItem.minprofit != null
                ? maxProfitTradeItem.minprofit.toFixed(2)
                : "-";
            const minProfitTradeTime = maxProfitTradeItem.tradeTime2
              ? maxProfitTradeItem.tradeTime2.slice(5)
              : "-";
            minProfitTradeStr = `${minProfit}万<br/>${minProfitTradeTime}`;
          }

          if (rangeEarningRateItem) {
            const profit =
              rangeEarningRateItem.profit != null
                ? rangeEarningRateItem.profit.toFixed(2)
                : "-";
            const zongzijin =
              rangeEarningRateItem.zongzijin != null
                ? rangeEarningRateItem.zongzijin.toFixed(0)
                : "-";
            const earningRate =
              rangeEarningRateItem.earningRate != null
                ? (rangeEarningRateItem.earningRate * 100).toFixed(2) + "%"
                : "-";

            rangeEarningRateStr = `收益：${profit}万，总资金：${zongzijin}万<br/>收益率：${earningRate}`;
          }

          if (rangeProfitItem) {
            const rangeProfit =
              rangeProfitItem.profit != null
                ? rangeProfitItem.profit.toFixed(2)
                : "-";
            rangeProfitStr = `${rangeProfit}万`;
          }

          if (yearEarningRateItem) {
            const yearProfit =
              yearEarningRateItem.zongzijin != null
                ? yearEarningRateItem.profit.toFixed(2)
                : "-";
            const earningRate =
              yearEarningRateItem.earningRate != null
                ? yearEarningRateItem.earningRate.toFixed(4)
                : "-";
            yearEarningRateStr = `收益：${yearProfit}万<br/>年化收益率：${earningRate}%`;
          }
          return {
            name: d.index, // 用户名
            shenglv: `${winRatePercentage}%`, // 胜率
            shengfuping: winLossDraw,
            yingKuiBi1: yingKuiStr1,
            yingKuiBi2: yingKuiStr2,
            initialProfit: initialProfitStr,
            dayMaxProfit: dailyMaxTradeStr,
            dayMaxBack: dailyMaxBackStr,
            maxProfit: maxProfitTradeStr,
            minProfit: minProfitTradeStr,
            rangeEarningRate: rangeEarningRateStr,
            rangeProfit: rangeProfitStr,
            yearEarningRate: yearEarningRateStr
          };
        });

        // 假设你使用的UI库能够接收这样的数据，渲染到表格
        this.tableData = formattedData; // 假设你有一个绑定到表格的数据对象
      } catch (err) {
        console.error("数据加载失败", err);
      }
    },
    handleTabsChange() {
      console.log("切换分支", this.activeTabs);

      console.log("切换分支", this.activeTab);

      if (this.activeTabs === "performance") {
        this.currentChartConfig = "tradingPerformance"; // 交易表现
      } else if (this.activeTabs === "capital") {
        this.currentChartConfig = "fundSituation"; // 资金情况
      } else if (this.activeTabs === "returns") {
        this.currentChartConfig = "earningPerformance"; // 收益表现
      } else {
        // 理论上不会进这里，因为radio必选一个
        this.currentChartConfig = null;
        console.warn("未选择任何分类！");
      }

      console.log("当前chartConfig:", this.currentChartConfig);
      this.loadChartData();
      // 然后你可以在这里重新加载图表
      // this.reloadChart();
    },
    // 初始化盈亏比/胜率
    initChart(winRateData, profitLossData, smoothLine) {
      console.log("胜率数据111:", winRateData);
      console.log("盈亏比数据222:", profitLossData);

      // X轴交易员姓名
      let traderNames = winRateData.map(d => d.index);

      // 胜率数据（转换为百分比）
      let winRates = winRateData.map(d => d.shenglv * 100);

      // 盈亏比数据
      let profitLossRatios = profitLossData.map(d => d.yingkuibi);

      // 盈亏值数据
      let profits = profitLossData.map(d => d.ying); // 盈
      let losses = profitLossData.map(d => d.kui); // 亏

      // 胜、平、败数据
      let wins = winRateData.map(d => d.sheng);
      let draws = winRateData.map(d => d.ping);
      let fails = winRateData.map(d => d.bai);

      console.log("输出myChart", this.myChart);
      // 清空现有配置
      this.myChart.clear();

      let option = {
        title: { text: "交易胜率 & 盈亏比", left: "center" },
        tooltip: {
          trigger: "axis",
          extraCssText: 'line-height: 2; font-size: 14px;',
          formatter: function(params) {
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
          }
        },
        legend: {
          data: ["胜率(%)", "盈亏比", "盈", "亏"],
          top: "12%",
          zIndex: 100
        },
        grid: {
          left: "15%",
          right: "15%",
          bottom: "15%",
          containLabel: true
        },
        xAxis: {
          type: "category",
          data: traderNames,
          axisLabel: {
            interval: 0,
            fontSize: 12
          }
        },
        yAxis: [
          {
            type: "value",
            name: "胜率 (%) / 盈亏值",
            min: 0,
            max: 100,
            axisLabel: { formatter: "{value} %" }
          },
          {
            type: "value",
            name: "盈亏比",
            min: 0,
            axisLabel: { formatter: "{value}" }
          }
        ],
        series: [
          {
            name: "胜率(%)",
            type: "bar",
            yAxisIndex: 0,
            data: winRates,
            color: "#2196F3",
            barWidth: "20%",
            label: { show: true, position: "top", formatter: "{c}%" }
          },
          {
            name: "盈",
            type: "bar",
            yAxisIndex: 0,
            data: profits,
            color: "#4CAF50",
            barWidth: "20%",
            label: { show: true, position: "top" }
          },
          {
            name: "亏",
            type: "bar",
            yAxisIndex: 0,
            data: losses,
            color: "#F44336",
            barWidth: "20%",
            label: { show: true, position: "top" }
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
            label: { show: true, position: "top" }
          }
        ]
      };

      this.myChart.setOption(option);
    },
    async applyDateRange() {
      console.log("输出搜索参数", this.searchParam);
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
      console.log("applyDateRange---输出channel", this.channelId);
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
          channelIds: this.channelIds // 包装成数组
        };
        console.log("输出params11", params);
        this.ApiParams = params;
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
        // Wait for the data to load before continuing
        await this.loadChartData(); // You should await this if loadChartData is an async function
        // this.initChart2(params);
        // 使用 await 获取请求结果，改为异步调用
        // 0418 21:00注释
        // const [winRateResponse, profitLossResponse] = await Promise.all([
        //   api.getWindRate(params), // 请求胜率数据
        //   api.getYingKui1(params) // 请求盈亏比数据
        // ]);
        // console.log("胜率数据:", winRateResponse);
        // console.log("盈亏比数据:", profitLossResponse);

        // if (
        //   winRateResponse.code === "00000" &&
        //   profitLossResponse.code === "00000"
        // ) {
        //   console.log("返回的都是00000");
        //   console.log("winRateResponse", winRateResponse);
        //   console.log("profitLossResponse", profitLossResponse);
        //   this.initChart(winRateResponse.value, profitLossResponse.value, true);
        // } else {
        //   console.error(
        //     "API 返回错误:",
        //     winRateResponse.code,
        //     profitLossResponse.code
        //   );
        // }
      } catch (error) {
        console.error("获取数据失败:", error);
      }
    },
    userSummaryChange: debounce(function(rows) {
      console.log("userSummaryChange", rows);
      const userIds = rows.map(n => n.userId);
      if (
        JSON.stringify(this.searchParam.userIds) !== JSON.stringify(userIds)
      ) {
        this.searchParam.userIds = userIds;
      }
      this.applyDateRange();
    }, 300),
    initChartA(data) {
      this.initChartDataA = data;
      const option = {
        title: {
          text: "债券交易明细统计",
          subtext: "债券交易量统计",
          x: "left"
        },
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        toolbox: {
          show: false,
          feature: {
            mark: { show: true },
            dataView: { show: true, readOnly: false },
            magicType: {
              show: true,
              type: ["pie", "funnel"],
              option: {
                funnel: {
                  x: "25%",
                  width: "50%",
                  funnelAlign: "left",
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
            name: "交易总量",
            type: "pie",
            radius: "55%",
            center: ["50%", "50%"],
            data: [],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)"
              }
            }
          }
        ]
      };

      if (data.length <= 0) return;
      const groupByTsCode = util.groupArrayToMap(
        data,
        item => item.tscode,
        item => item
      );
      let seriesData = [];
      Array.from(groupByTsCode.entries()).forEach(([key, value]) => {
        if (this.eChartRadioA === 0) {
          const res = {
            value: value.reduce((sum, item) => {
              return sum + parseFloat(item.volume || 0);
            }, 0),
            name: key
          };
          seriesData.push(res);
        } else {
          const res = { value: value.length, name: key };
          seriesData.push(res);
        }
      });
      option.series[0].data = seriesData;
      const chartDom = this.$refs.chartA;
      if (chartDom) {
        this.eChartA = echarts.init(chartDom, null, { width: "auto" });
        option && this.eChartA.setOption(option, true);
      }
    },
    initChartB(data) {
      this.userSummarys = data;
      let option = {
        title: {
          x: "center",
          text: "用户交易明细汇总"
        },
        tooltip: {
          trigger: "axis"
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
            type: "category",
            show: false,
            data: []
          }
        ],
        yAxis: [
          {
            type: "value",
            show: false
          },
          {
            type: "value",
            name: "总盈亏/万",
            position: "left",
            axisLabel: {
              formatter: "{value}.0000"
            }
          }
        ],
        series: [
          {
            name: "用户交易",
            type: "bar",
            itemStyle: {
              normal: {
                color: function(params) {
                  // build a color map as your need.
                  // var colorList = [
                  //   '#C1232B', '#B5C334', '#FCCE10', '#E87C25', '#27727B',
                  //   '#FE8463', '#9BCA63', '#FAD860', '#F3A43B', '#60C0DD',
                  //   '#D7504B', '#C6E579', '#F4E001', '#F0805A', '#26C0C0'
                  // ];
                  // const index = params.dataIndex >= colorList.length ? (params.dataIndex - colorList.length) : params.dataIndex
                  return "#009688";
                },
                label: {
                  show: true,
                  position: "top",
                  formatter: "{b}"
                }
              }
            },
            data: []
          },
          {
            name: "盈亏/万",
            type: "line",
            yAxisIndex: 1,
            smooth: true,
            // 设置数据点颜色为红色
            itemStyle: {
              color: "red"
            },
            data: []
          }
        ]
      };
      const optionData = data
        ? data.filter((n, i) => {
            return n.limitBid + n.limitOffer > 0;
          })
        : [];

      option.xAxis[0].data = optionData
        ? optionData.map((n, i) => {
            return n.nickName;
          })
        : [];

      option.series[0].data = optionData
        ? optionData.map((n, i) => {
            return n.limitBid + n.limitOffer;
          })
        : [];

      const series1 = optionData
        ? optionData.map((n, i) => {
            return n.solidProfit;
          })
        : [];
      option.series[1].data = series1.map(n => parseFloat(n.replace(/,/g, "")));
      // option.series[0].markPoint.data = data ? data.map((n, i) => {
      //   return { xAxis: i, y: 350, name: n.nickName, symbolSize: 20 }
      // }) : []
      const chartDom = this.$refs.chartB;
      if (chartDom) {
        this.eChartB = echarts.init(chartDom, null, { width: "auto" });
        option && this.eChartB.setOption(option, true);
      }
    },
    initChartC() {
      const option = {
        title: {
          x: "left",
          text: "产品收益明细"
        },
        tooltip: {
          trigger: "axis"
        },
        legend: {
          x: "right",
          data: ["权益一号", "权益二号"]
        },
        toolbox: {
          show: false,
          feature: {
            mark: { show: true },
            dataView: { show: true, readOnly: false },
            magicType: { show: true, type: ["line", "bar", "stack", "tiled"] },
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
            type: "category",
            boundaryGap: false,
            data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
          }
        ],
        yAxis: [
          {
            type: "value",
            name: "资金池/万",
            position: "left",
            axisLabel: {
              formatter: "{value}"
            },
            max: 101000,
            min: 99900
          }
        ],
        series: [
          {
            name: "权益一号",
            type: "line",
            stack: "权益一号",
            smooth: true,
            data: [100000, 100720, 100050, 100100, 100620, 100520, 100120]
          },
          {
            name: "权益二号",
            type: "line",
            stack: "权益二号",
            smooth: true,
            data: [100100, 99989, 100020, 100120, 100620, 100920, 100720]
          }
        ]
      };
      const chartDom = this.$refs.chartC;
      if (chartDom) {
        this.eChartC = echarts.init(chartDom, null, { width: "auto" });
        this.eChartC.setOption(option, true);
      }
    },
    initChartD(data) {
      const option = {
        title: {
          x: "left",
          text: "平仓收益走势图"
        },
        tooltip: {
          trigger: "axis"
        },
        toolbox: {
          show: false,
          feature: {
            mark: { show: true },
            dataView: { show: true, readOnly: false },
            magicType: { show: true, type: ["line", "bar", "stack", "tiled"] },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        calculable: true,
        xAxis: [
          {
            type: "category",
            boundaryGap: false,
            data: []
          }
        ],
        yAxis: [
          {
            type: "value",
            name: "盈亏额/万",
            position: "left",
            axisLabel: {
              formatter: "{value}.0000"
            }
          }
        ],
        series: []
      };

      let xAxisData = [];
      let seriesData = [];

      if (
        this.searchParam.userIds.length > 0 &&
        this.searchParam.userIds.length <= 6
      ) {
        data.forEach(n => {
          n.date = util.dateFormat(n.createTime, "YYYY-MM-DD");
        });
        xAxisData = util.getDatesInRange(
          this.searchParam.date[0],
          this.searchParam.date[1],
          "YYYY-MM-DD"
        );
        // xAxisData = [...new Set(data.map(n => n.date))];
        // xAxisData.sort(function (a, b) {
        //   return a < b ? -1 : 1
        // })
        const groupByUser = util.groupArrayToMap(
          data,
          item => item.yanjiuyuanId,
          item => item
        );
        Array.from(groupByUser.entries()).forEach(([key, value]) => {
          let seriesData1 = [];
          const groupByDate = util.groupArrayToMap(
            value,
            item => item.date,
            item => parseFloat(item.profit || 0)
          );
          xAxisData.forEach(n => {
            let val = groupByDate.get(n);
            if (val && val.length > 0) {
              const sum =
                val.reduce((sum, item) => {
                  return sum + parseFloat(item || 0) * 10000;
                }, 0) / 10000;
              seriesData1.push(
                (seriesData1.length > 0
                  ? seriesData1[seriesData1.length - 1]
                  : 0) + (sum || 0)
              );
            } else {
              seriesData1.push(
                (seriesData1.length > 0
                  ? seriesData1[seriesData1.length - 1]
                  : 0) + 0
              );
            }
          });

          // value.forEach(n => {
          //   seriesData1.push(util.moneyFormat(parseFloat(seriesData1.length > 0 ? seriesData1[seriesData1.length - 1] : 0) + parseFloat(n.profit || 0), 4))
          // })
          seriesData1 = seriesData1.map(n => n.toFixed(4));
          const user = this.userSummarys.filter(n => n.userId === key);
          let series = {
            name: user[0].nickName + ": 截至盈亏",
            type: "line",
            // stack: '总量',
            yAxisIndex: 0,
            symbol: "none",
            smooth: true,
            data: seriesData1
          };
          option.series.push(series);
          // console.log(key, series)
        });
      } else {
        data.forEach(n => {
          n.date = util.dateFormat(n.createTime, "YYYY-MM-DD");
        });
        xAxisData = util.getDatesInRange(
          this.searchParam.date[0],
          this.searchParam.date[1],
          "YYYY-MM-DD"
        );
        const groupByDate = util.groupArrayToMap(
          data,
          item => item.date,
          item => parseFloat(item.profit || 0)
        );
        xAxisData.forEach(n => {
          let val = groupByDate.get(n);
          if (val && val.length > 0) {
            const sum =
              val.reduce((sum, item) => {
                return sum + parseFloat(item || 0) * 10000;
              }, 0) / 10000;
            seriesData.push(
              (seriesData.length > 0 ? seriesData[seriesData.length - 1] : 0) +
                (sum || 0)
            );
          } else {
            seriesData.push(
              (seriesData.length > 0 ? seriesData[seriesData.length - 1] : 0) +
                0
            );
          }
        });
        const seriesDatas = seriesData.map(n => n.toFixed(4));
        option.series.push({
          name: "截至盈亏",
          type: "line",
          // stack: '总量',
          yAxisIndex: 0,
          symbol: "none",
          smooth: true,
          data: seriesDatas
        });
      }

      option.xAxis[0].data = xAxisData;
      const chartDomD = this.$refs.chartD;
      if (chartDomD) {
        this.eChartD = echarts.init(chartDomD, null, { width: "auto" });
        this.eChartD.setOption(option, true);
      }

      //
      let optionSec = {
        title: {
          x: "left",
          text: "平仓品种收益"
        },
        tooltip: {
          trigger: "axis"
        },
        toolbox: {
          show: false,
          feature: {
            mark: { show: true },
            dataView: { show: true, readOnly: false },
            magicType: { show: true, type: ["line", "bar", "stack", "tiled"] },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        xAxis: [
          {
            type: "category",
            data: []
          }
        ],
        yAxis: [
          {
            type: "value",
            name: "总盈亏/万",
            position: "left",
            axisLabel: {
              formatter: "{value}.0000"
            }
          }
        ],
        series: [
          {
            name: "当前盈亏",
            data: [],
            type: "bar",
            itemStyle: {
              normal: {
                label: {
                  show: true,
                  position: "top",
                  formatter: "{b}"
                }
              }
            },
            barWidth: "60%"
          }
        ]
      };

      xAxisData = [];
      seriesData = [];
      const groupByTscode = util.groupArrayToMap(
        data,
        item => item.tscode,
        item => item
      );
      Array.from(groupByTscode.entries()).forEach(([key, value]) => {
        xAxisData.push(key);
        const sum = util.moneyFormat(
          value.reduce((sum, item) => {
            return sum + parseFloat(item.profit || 0) * 10000;
          }, 0) / 10000,
          4
        );
        seriesData.push({
          value: sum,
          itemStyle: { color: sum > 0 ? "green" : "red" }
        });
      });
      optionSec.xAxis[0].data = xAxisData;
      optionSec.series[0].data = seriesData;
      const chartDomE = this.$refs.chartE;
      if (chartDomE) {
        this.eChartE = echarts.init(chartDomE, null, { width: "auto" });
        this.eChartE.setOption(optionSec, true);
      }
      this.initChartA(data);
      // if (this.setAuth('system:alltrans:query')) {
      //   this.initChartA(data)
      // }
    }
  },

  mounted() {
    if (window.v1) {
      Promise.all([]).then(async () => {
        const response = await window.v1.getWinThis();
        this.child = response.data && response.data.child;
      });
    }
    console.log("进入mounted！！！");
    // 等待DOM渲染完成后再初始化图表
    this.$nextTick(() => {
      // 延时初始化图表，确保DOM渲染完成
      setTimeout(() => {
        this.initChartC();
        // this.initChartD()
      }, 300);

      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      this.searchParam.date = [start, end];

      this.initFrameH("userSummaryH", 300);

      // 初始化 ECharts 图表
      // 初始化 ECharts 图表
      const chartContainer = this.$refs.mainChart; // 确保ref一致
      if (chartContainer) {
        this.myChart = echarts.init(chartContainer);
        console.log("打印myChart", this.myChart);
      } else {
        console.error("图表容器未找到！");
      }

      // 窗口大小变化时触发
      this.$winResize(() => {
        if (this.myChart) {
          this.myChart.resize();
          console.log("窗口改变大小");
        }
        this.initFrameH("userSummaryH", 700);
      });

      this.loadChartData();
    });
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/style.scss";
/* 自定义选中行的颜色 */
/* 自定义选中行的土黄色背景色 */
/* 通过更精确的选择器修改选中行背景色 */
.el-table__row.current,
.el-table__row.selected {
  background-color: #f4a261 !important; /* 土黄色背景色 */
  color: #fff !important; /* 白色文字 */
}

.table-header {
  background-color: #f5f7fa;
  color: #333;
  font-weight: bold;
}

.table-cell {
  padding: 8px 10px;
  font-size: 13px;
  color: #444;
  border-bottom: 1px solid #ebeef5;
}

.el-table th,
.el-table td {
  text-align: center; /* 可选：让数值居中 */
}
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
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
    }
  }

  .board-echats {
    margin-left: 10px;
    margin-right: 10px;
    .board-echats-box {
      height: 350px;
      background: white;
      border-radius: 3px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
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
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
      margin: 10px;
      padding: 5px;
    }
  }
  .custom-date-picker {
    font-size: 16px;
    font-weight: bold;
  }
  .custom-date-picker .el-picker-panel {
    font-size: 16px;
    font-weight: bold;
  }
  .board-trans {
    padding: 0px 0;

    .board-echats-box {
      height: 350px;
      background: white;
      border-radius: 3px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
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
