<template>
  <v-app>
    <v-main class="grey lighten-3">
      <v-stepper v-model="e1" style="height: 100%">
        <v-stepper-header>
          <v-stepper-step :complete="e1 > 1" step="1"> Span </v-stepper-step>

          <v-divider></v-divider>

          <v-stepper-step :complete="e1 > 2" step="2">
            Question-Answers
          </v-stepper-step>
        </v-stepper-header>

        <v-stepper-items>
          <!-- Node -->
          <v-stepper-content step="1">
            <v-row>
              <v-col cols="12" sm="5">
                <SourceArticle
                  :source="this.source"
                  :mention="currentSpan"
                  :answer="[]"
                ></SourceArticle>
              </v-col>
              <v-col>
                <NodeLevel
                  ref="node"
                  :summary="summary"
                  :spans="answers"
                  @nextStep="nextStep()"
                  @selectMention="selectMention($event)"
                  @assignPositive="assignPositive($event)"
                  @assignNegative="assignNegative($event)"
                  @updateNegativeSpans="updateNegativeSpans($event)"
                ></NodeLevel>
                <v-container class="justify-center">
                  
              <v-textarea
              v-model="notes"
              color="primary"
            >
              <template v-slot:label>
                <div>
                  Notes <small>(optional)</small>
                </div>
              </template>
            </v-textarea>
                  
                </v-container>
                
              </v-col>
            </v-row>

            <div style="text-align: right">
              <v-btn color="primary" @click="e1 = 2">
                Next Step <v-icon> mdi-arrow-right</v-icon>
              </v-btn>
            </div>
          </v-stepper-content>

          <!-- QA -->
          <v-stepper-content step="2">
            <v-row>
              <v-col cols="12" sm="5">
                <SourceArticle
                  :source="this.source"
                  :mention="currentSpan"
                  :answer="currentAnswer"
                ></SourceArticle>
              </v-col>
              <v-col>
                <QALevel
                  ref="qa"
                  :summary="summary"
                  :qas="qas"
                  :predicates="predicates"
                  :answers="answers"
                  :negativeSpans="Array.from(negativeSpans)"
                  @selectMention="selectPredicate($event)"
                  @selectAnswers="selectAnswers($event)"
                  @previousStep="previousStep()"
                ></QALevel>

                <v-container class="justify-center">
                  
                  <v-textarea
                  v-model="notes"
                  color="primary"
                >
                  <template v-slot:label>
                    <div>
                      Notes <small>(optional)</small>
                    </div>
                  </template>
                </v-textarea>
                      
                    </v-container>
              </v-col>
            </v-row>

            <v-row justify="space-between">
              <v-btn
                :class="['ma-3', 'white--text']"
                color="primary"
                @click="e1 = 1"
              >
                <v-icon> mdi-arrow-left</v-icon> Previous Step
              </v-btn>

              <v-btn
                    :class="['ma-3', 'white--text']"
                    color="primary"
                    @click="finish()"
                  >
                    Finish <v-icon> mdi-checkbox-marked-circle</v-icon>
                  </v-btn>

              
              
              
            </v-row>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-main>
  </v-app>
</template>

<script>
// import jsonData from "./data/annotation_files/0ceb4cea35c3e964a2e54ec9715de42e1319fd03.json";
// import jsonData from "./data/annotation_files/69db30b6047a2aadd64f3c6eeb23cc3437078cf1.json"
import NodeLevel from "./components/NodeLevel.vue";
import SourceArticle from "./components/SourceArticle.vue";
import QALevel from "./components/QALevel.vue";
import Vuetify from "vuetify/lib";
import Vue from "vue";

// FRANK annotation

// XSUM

// import jsonData from "./data/annotation_files_frank/21197406_BERTS2S.json"
import jsonData from "./data/annotation_files_frank/39202525_BERTS2S.json";
// import jsonData from "./data/annotation_files_frank/35082344_BERTS2S.json"
// import jsonData from "./data/annotation_files_frank/24553569_BERTS2S.json"

// CNN
// import jsonData from "./data/annotation_files_frank/f364b58c01042c853a5d980e094d680304273162_bart.json"
// import jsonData from "./data/annotation_files_frank/47681f33b383d3000a13cff5c5429771204619ed_bert_sum.json"
// import jsonData from "./data/annotation_files_frank/47681f33b383d3000a13cff5c5429771204619ed_bart.json"
// import jsonData from "./data/annotation_files_frank/ce551de8d9a69e9f2b51ccdd465c8150821936ce_bart.json"
// import jsonData from "./data/annotation_files_frank/fb1117897822bddb6586aa283e4a67d82b507f3a_bart.json"
// import jsonData from "./data/annotation_files_frank/578933f933255e7e22695c68f7e544dbc749dae3_bart.json"

import {
  VIcon,
  VDivider,
  VBtn,
  VStepper,
  VStepperContent,
  VStepperHeader,
  VStepperItems,
  VStepperStep,
  VRow,
  VCol,
  VApp,
  VMain,
} from "vuetify/lib";

Vue.use(Vuetify);
var vuetify = new Vuetify({});

export default {
  name: "App",
  vuetify,
  components: {
    SourceArticle,
    NodeLevel,
    QALevel,
    VIcon,
    VDivider,
    VBtn,
    VStepper,
    VStepperContent,
    VStepperHeader,
    VStepperItems,
    VStepperStep,
    VRow,
    VCol,
    VApp,
    VMain,
  },
  props: {
    json: {
      type: String,
      default: "",
    },
  },
  data() {
    const data =
      !this.json || this.json == "${data}"
        ? jsonData
        : JSON.parse(unescape(this.json).replace("\u00e2\u20ac\u2122", "'"));
    data.links = ["Span", "QAs", "Global"];
    data.selectedTab = "Span";
    data.e1 = 1;
    data.selectedTabIndex = 0;
    data.done = false;
    data.predicates = data.spans.filter((x) => x.predicate);
    data.answers = data.spans.filter((x) => !x.predicate);
    data.negativeSpans = new Set();
    data.negativeQAs = new Set();
    data.filteredLocalQAs = data.qas;
    data.currentSpan = data.spans.slice(
      data.spans[0].start,
      data.spans[0].end + 1
    );
    data.currentAnswer = [];
    data.start = new Date();
    data.filteredPredicates = data.spans.filter((x) => x.predicate);
    data.positiveQAs = {};
    data.dialog = false;
    data.notes = "";
    return data;
  },
  computed: {
    showFinishButton: function () {
      return this.qas.every((qa) => "label" in qa && qa.label != undefined);
    },
  },
  methods: {
    filterQAs: function (set) {
      return this.qas.filter((x) => set.has(x.id));
    },
    assignPositive: function (spanIndex) {
      this.answers[spanIndex].label = 1;
      this.$forceUpdate();
    },
    assignNegative: function (spanIndex) {
      this.answers[spanIndex].label = 0;
      this.$forceUpdate();
    },
    updateNegativeSpans: function (negativeSpans) {
      this.negativeSpans = negativeSpans;
      this.filteredPredicates = this.spans.filter(
        (x) => x.predicate && !negativeSpans.has(x.id)
      );
      let filteredQAIds = new Set();
      this.filteredLocalQAs = this.qas.filter((x) => !filteredQAIds.has(x.id));
    },
    nextStep: function () {
      this.selectedTabIndex += 1;
    },
    previousStep: function () {
      this.selectedTabIndex -= 1;
    },
    finish: function () {
      let end = new Date();
      let diff = (end.getTime() - this.start.getTime()) / 1000;

      let data = {
        summaryId: this.summaryId,
        source: this.source,
        summary: this.summary,
        spans: this.spans,
        positiveQAs: this.getPositiveQAs(),
        notes: this.notes,
        duration: diff,
      };

      const doc = document.createElement("a");
      const file = new Blob([JSON.stringify(data, null, 4)], {
        type: "text/plain",
      });
      doc.href = URL.createObjectURL(file);
      doc.download = this.summaryId + ".json";
      doc.click();
    },
    selectMention: function (span) {
      if (this.e1 == 1) {
        this.currentSpan = this.summary.slice(span.start, span.end);
      }
    },
    selectPredicate: function (span) {
      if (this.e1 != 1) {
        this.currentSpan = this.summary.slice(span.start, span.end);
      }
    },
    selectAnswers: function (tokenIndexes) {
      if (this.e1 != 1) {
        this.currentAnswer = Array.from(tokenIndexes)
          .sort((a, b) => a - b)
          .map((x) => this.summary[x]);
      } else {
        this.currentAnswer = [];
      }
    },
    getPositiveQAs: function () {
      let positiveQAs = {};
      for (const [predicateId, clusters] of Object.entries(
        this.$refs.qa.positiveQAs
      )) {
        positiveQAs[predicateId] = [];
        clusters.forEach((cluster, clusterId) => {
          positiveQAs[predicateId].push([]);
          cluster.forEach((qa) => {
            positiveQAs[predicateId][clusterId].push(qa.id);
          });
        });
      }
      return positiveQAs;
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css?family=Material+Icons");
@import url("https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900");
@import url("https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css");
/* @import url("../node_modules/vuetify/dist/vuetify.min.css"); */
@import "../node_modules/vuetify/dist/vuetify.min.css";

.current {
  background: #ddeff9;
  color: #2d9cdb;
}
.viewed:hover {
  font-weight: medium;
  color: #b16a00;
}
.token:hover {
  background-color: #ffffb8;
}
</style>