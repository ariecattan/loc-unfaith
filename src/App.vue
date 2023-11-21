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
                  :annotatedQAs="annotatedQAs"
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
import vuetify from "@/plugins/vuetify";




// import Vuetify from "vuetify/lib";
// import Vue from "vue";

// FRANK annotation

// XSUM

// import jsonData from "./data/annotation_files_frank/21197406_BERTS2S.json"
// import jsonData from "./data/annotation_files_frank/39202525_BERTS2S.json";
// import jsonData from "./data/annotation_files_frank/35082344_BERTS2S.json"
// import jsonData from "./data/annotation_files_frank/24553569_BERTS2S.json"

// CNN
// import jsonData from "./data/annotation_files_frank/f364b58c01042c853a5d980e094d680304273162_bart.json"
// import jsonData from "./data/annotation_files_frank/47681f33b383d3000a13cff5c5429771204619ed_bert_sum.json"
// import jsonData from "./data/annotation_files_frank/47681f33b383d3000a13cff5c5429771204619ed_bart.json"
// import jsonData from "./data/annotation_files_frank/ce551de8d9a69e9f2b51ccdd465c8150821936ce_bart.json"
// import jsonData from "./data/annotation_files_frank/fb1117897822bddb6586aa283e4a67d82b507f3a_bart.json"
// import jsonData from "./data/annotation_files_frank/578933f933255e7e22695c68f7e544dbc749dae3_bart.json"


import jsonData from "./data/aggrefact/0.json"

// import jsonData from "./data/tmp.json"
// import jsonData from "../../evaluation/data/arie/61_bart_xsum.json"

// import jsonData from "../../evaluation/data/arie/33_bart_xsum.json"
// import jsonData from "/Users/arie/Downloads/4_bart_xsum (1).json"


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

// Vue.use(Vuetify);
// var vuetify = new Vuetify({});



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
    data.filteredLocalQAs = data.qas;
    data.currentSpan = data.spans.slice(
      data.spans[0].start,
      data.spans[0].end + 1
    );
    data.currentAnswer = [];
    data.start = new Date();
    data.filteredPredicates = data.spans.filter((x) => x.predicate);
    // data.positiveQAs = {};
    data.dialog = false;
    data.annotatedQAs = data.positiveQAs ? data.positiveQAs : {};
    data.notes = data.notes ? data.notes : "";
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
        qas: this.qas,
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


<!-- This is hack for loading the CSS of vuetify -->
<style type="text/css" id="vuetify-theme-stylesheet">
  .v-application a { color: #1976d2; }
  .v-application .primary {
    background-color: #1976d2 !important;
    border-color: #1976d2 !important;
  }
  .v-application .primary--text {
    color: #1976d2 !important;
    caret-color: #1976d2 !important;
  }
  .v-application .primary.lighten-5 {
    background-color: #c7fdff !important;
    border-color: #c7fdff !important;
  }
  .v-application .primary--text.text--lighten-5 {
    color: #c7fdff !important;
    caret-color: #c7fdff !important;
  }
  .v-application .primary.lighten-4 {
    background-color: #a8e0ff !important;
    border-color: #a8e0ff !important;
  }
  .v-application .primary--text.text--lighten-4 {
    color: #a8e0ff !important;
    caret-color: #a8e0ff !important;
  }
  .v-application .primary.lighten-3 {
    background-color: #8ac5ff !important;
    border-color: #8ac5ff !important;
  }
  .v-application .primary--text.text--lighten-3 {
    color: #8ac5ff !important;
    caret-color: #8ac5ff !important;
  }
  .v-application .primary.lighten-2 {
    background-color: #6aaaff !important;
    border-color: #6aaaff !important;
  }
  .v-application .primary--text.text--lighten-2 {
    color: #6aaaff !important;
    caret-color: #6aaaff !important;
  }
  .v-application .primary.lighten-1 {
    background-color: #488fef !important;
    border-color: #488fef !important;
  }
  .v-application .primary--text.text--lighten-1 {
    color: #488fef !important;
    caret-color: #488fef !important;
  }
  .v-application .primary.darken-1 {
    background-color: #005eb6 !important;
    border-color: #005eb6 !important;
  }
  .v-application .primary--text.text--darken-1 {
    color: #005eb6 !important;
    caret-color: #005eb6 !important;
  }
  .v-application .primary.darken-2 {
    background-color: #00479b !important;
    border-color: #00479b !important;
  }
  .v-application .primary--text.text--darken-2 {
    color: #00479b !important;
    caret-color: #00479b !important;
  }
  .v-application .primary.darken-3 {
    background-color: #003180 !important;
    border-color: #003180 !important;
  }
  .v-application .primary--text.text--darken-3 {
    color: #003180 !important;
    caret-color: #003180 !important;
  }
  .v-application .primary.darken-4 {
    background-color: #001e67 !important;
    border-color: #001e67 !important;
  }
  .v-application .primary--text.text--darken-4 {
    color: #001e67 !important;
    caret-color: #001e67 !important;
  }
  .v-application .secondary {
    background-color: #424242 !important;
    border-color: #424242 !important;
  }
  .v-application .secondary--text {
    color: #424242 !important;
    caret-color: #424242 !important;
  }
  .v-application .secondary.lighten-5 {
    background-color: #c1c1c1 !important;
    border-color: #c1c1c1 !important;
  }
  .v-application .secondary--text.text--lighten-5 {
    color: #c1c1c1 !important;
    caret-color: #c1c1c1 !important;
  }
  .v-application .secondary.lighten-4 {
    background-color: #a6a6a6 !important;
    border-color: #a6a6a6 !important;
  }
  .v-application .secondary--text.text--lighten-4 {
    color: #a6a6a6 !important;
    caret-color: #a6a6a6 !important;
  }
  .v-application .secondary.lighten-3 {
    background-color: #8b8b8b !important;
    border-color: #8b8b8b !important;
  }
  .v-application .secondary--text.text--lighten-3 {
    color: #8b8b8b !important;
    caret-color: #8b8b8b !important;
  }
  .v-application .secondary.lighten-2 {
    background-color: #727272 !important;
    border-color: #727272 !important;
  }
  .v-application .secondary--text.text--lighten-2 {
    color: #727272 !important;
    caret-color: #727272 !important;
  }
  .v-application .secondary.lighten-1 {
    background-color: #595959 !important;
    border-color: #595959 !important;
  }
  .v-application .secondary--text.text--lighten-1 {
    color: #595959 !important;
    caret-color: #595959 !important;
  }
  .v-application .secondary.darken-1 {
    background-color: #2c2c2c !important;
    border-color: #2c2c2c !important;
  }
  .v-application .secondary--text.text--darken-1 {
    color: #2c2c2c !important;
    caret-color: #2c2c2c !important;
  }
  .v-application .secondary.darken-2 {
    background-color: #171717 !important;
    border-color: #171717 !important;
  }
  .v-application .secondary--text.text--darken-2 {
    color: #171717 !important;
    caret-color: #171717 !important;
  }
  .v-application .secondary.darken-3 {
    background-color: #000000 !important;
    border-color: #000000 !important;
  }
  .v-application .secondary--text.text--darken-3 {
    color: #000000 !important;
    caret-color: #000000 !important;
  }
  .v-application .secondary.darken-4 {
    background-color: #000000 !important;
    border-color: #000000 !important;
  }
  .v-application .secondary--text.text--darken-4 {
    color: #000000 !important;
    caret-color: #000000 !important;
  }
  .v-application .accent {
    background-color: #82b1ff !important;
    border-color: #82b1ff !important;
  }
  .v-application .accent--text {
    color: #82b1ff !important;
    caret-color: #82b1ff !important;
  }
  .v-application .accent.lighten-5 {
    background-color: #ffffff !important;
    border-color: #ffffff !important;
  }
  .v-application .accent--text.text--lighten-5 {
    color: #ffffff !important;
    caret-color: #ffffff !important;
  }
  .v-application .accent.lighten-4 {
    background-color: #f8ffff !important;
    border-color: #f8ffff !important;
  }
  .v-application .accent--text.text--lighten-4 {
    color: #f8ffff !important;
    caret-color: #f8ffff !important;
  }
  .v-application .accent.lighten-3 {
    background-color: #daffff !important;
    border-color: #daffff !important;
  }
  .v-application .accent--text.text--lighten-3 {
    color: #daffff !important;
    caret-color: #daffff !important;
  }
  .v-application .accent.lighten-2 {
    background-color: #bce8ff !important;
    border-color: #bce8ff !important;
  }
  .v-application .accent--text.text--lighten-2 {
    color: #bce8ff !important;
    caret-color: #bce8ff !important;
  }
  .v-application .accent.lighten-1 {
    background-color: #9fccff !important;
    border-color: #9fccff !important;
  }
  .v-application .accent--text.text--lighten-1 {
    color: #9fccff !important;
    caret-color: #9fccff !important;
  }
  .v-application .accent.darken-1 {
    background-color: #6596e2 !important;
    border-color: #6596e2 !important;
  }
  .v-application .accent--text.text--darken-1 {
    color: #6596e2 !important;
    caret-color: #6596e2 !important;
  }
  .v-application .accent.darken-2 {
    background-color: #467dc6 !important;
    border-color: #467dc6 !important;
  }
  .v-application .accent--text.text--darken-2 {
    color: #467dc6 !important;
    caret-color: #467dc6 !important;
  }
  .v-application .accent.darken-3 {
    background-color: #2364aa !important;
    border-color: #2364aa !important;
  }
  .v-application .accent--text.text--darken-3 {
    color: #2364aa !important;
    caret-color: #2364aa !important;
  }
  .v-application .accent.darken-4 {
    background-color: #004c90 !important;
    border-color: #004c90 !important;
  }
  .v-application .accent--text.text--darken-4 {
    color: #004c90 !important;
    caret-color: #004c90 !important;
  }
  .v-application .error {
    background-color: #ff5252 !important;
    border-color: #ff5252 !important;
  }
  .v-application .error--text {
    color: #ff5252 !important;
    caret-color: #ff5252 !important;
  }
  .v-application .error.lighten-5 {
    background-color: #ffe4d5 !important;
    border-color: #ffe4d5 !important;
  }
  .v-application .error--text.text--lighten-5 {
    color: #ffe4d5 !important;
    caret-color: #ffe4d5 !important;
  }
  .v-application .error.lighten-4 {
    background-color: #ffc6b9 !important;
    border-color: #ffc6b9 !important;
  }
  .v-application .error--text.text--lighten-4 {
    color: #ffc6b9 !important;
    caret-color: #ffc6b9 !important;
  }
  .v-application .error.lighten-3 {
    background-color: #ffa99e !important;
    border-color: #ffa99e !important;
  }
  .v-application .error--text.text--lighten-3 {
    color: #ffa99e !important;
    caret-color: #ffa99e !important;
  }
  .v-application .error.lighten-2 {
    background-color: #ff8c84 !important;
    border-color: #ff8c84 !important;
  }
  .v-application .error--text.text--lighten-2 {
    color: #ff8c84 !important;
    caret-color: #ff8c84 !important;
  }
  .v-application .error.lighten-1 {
    background-color: #ff6f6a !important;
    border-color: #ff6f6a !important;
  }
  .v-application .error--text.text--lighten-1 {
    color: #ff6f6a !important;
    caret-color: #ff6f6a !important;
  }
  .v-application .error.darken-1 {
    background-color: #df323b !important;
    border-color: #df323b !important;
  }
  .v-application .error--text.text--darken-1 {
    color: #df323b !important;
    caret-color: #df323b !important;
  }
  .v-application .error.darken-2 {
    background-color: #bf0025 !important;
    border-color: #bf0025 !important;
  }
  .v-application .error--text.text--darken-2 {
    color: #bf0025 !important;
    caret-color: #bf0025 !important;
  }
  .v-application .error.darken-3 {
    background-color: #9f0010 !important;
    border-color: #9f0010 !important;
  }
  .v-application .error--text.text--darken-3 {
    color: #9f0010 !important;
    caret-color: #9f0010 !important;
  }
  .v-application .error.darken-4 {
    background-color: #800000 !important;
    border-color: #800000 !important;
  }
  .v-application .error--text.text--darken-4 {
    color: #800000 !important;
    caret-color: #800000 !important;
  }
  .v-application .info {
    background-color: #2196f3 !important;
    border-color: #2196f3 !important;
  }
  .v-application .info--text {
    color: #2196f3 !important;
    caret-color: #2196f3 !important;
  }
  .v-application .info.lighten-5 {
    background-color: #d4ffff !important;
    border-color: #d4ffff !important;
  }
  .v-application .info--text.text--lighten-5 {
    color: #d4ffff !important;
    caret-color: #d4ffff !important;
  }
  .v-application .info.lighten-4 {
    background-color: #b5ffff !important;
    border-color: #b5ffff !important;
  }
  .v-application .info--text.text--lighten-4 {
    color: #b5ffff !important;
    caret-color: #b5ffff !important;
  }
  .v-application .info.lighten-3 {
    background-color: #95e8ff !important;
    border-color: #95e8ff !important;
  }
  .v-application .info--text.text--lighten-3 {
    color: #95e8ff !important;
    caret-color: #95e8ff !important;
  }
  .v-application .info.lighten-2 {
    background-color: #75ccff !important;
    border-color: #75ccff !important;
  }
  .v-application .info--text.text--lighten-2 {
    color: #75ccff !important;
    caret-color: #75ccff !important;
  }
  .v-application .info.lighten-1 {
    background-color: #51b0ff !important;
    border-color: #51b0ff !important;
  }
  .v-application .info--text.text--lighten-1 {
    color: #51b0ff !important;
    caret-color: #51b0ff !important;
  }
  .v-application .info.darken-1 {
    background-color: #007cd6 !important;
    border-color: #007cd6 !important;
  }
  .v-application .info--text.text--darken-1 {
    color: #007cd6 !important;
    caret-color: #007cd6 !important;
  }
  .v-application .info.darken-2 {
    background-color: #0064ba !important;
    border-color: #0064ba !important;
  }
  .v-application .info--text.text--darken-2 {
    color: #0064ba !important;
    caret-color: #0064ba !important;
  }
  .v-application .info.darken-3 {
    background-color: #004d9f !important;
    border-color: #004d9f !important;
  }
  .v-application .info--text.text--darken-3 {
    color: #004d9f !important;
    caret-color: #004d9f !important;
  }
  .v-application .info.darken-4 {
    background-color: #003784 !important;
    border-color: #003784 !important;
  }
  .v-application .info--text.text--darken-4 {
    color: #003784 !important;
    caret-color: #003784 !important;
  }
  .v-application .success {
    background-color: #4caf50 !important;
    border-color: #4caf50 !important;
  }
  .v-application .success--text {
    color: #4caf50 !important;
    caret-color: #4caf50 !important;
  }
  .v-application .success.lighten-5 {
    background-color: #dcffd6 !important;
    border-color: #dcffd6 !important;
  }
  .v-application .success--text.text--lighten-5 {
    color: #dcffd6 !important;
    caret-color: #dcffd6 !important;
  }
  .v-application .success.lighten-4 {
    background-color: #beffba !important;
    border-color: #beffba !important;
  }
  .v-application .success--text.text--lighten-4 {
    color: #beffba !important;
    caret-color: #beffba !important;
  }
  .v-application .success.lighten-3 {
    background-color: #a2ff9e !important;
    border-color: #a2ff9e !important;
  }
  .v-application .success--text.text--lighten-3 {
    color: #a2ff9e !important;
    caret-color: #a2ff9e !important;
  }
  .v-application .success.lighten-2 {
    background-color: #85e783 !important;
    border-color: #85e783 !important;
  }
  .v-application .success--text.text--lighten-2 {
    color: #85e783 !important;
    caret-color: #85e783 !important;
  }
  .v-application .success.lighten-1 {
    background-color: #69cb69 !important;
    border-color: #69cb69 !important;
  }
  .v-application .success--text.text--lighten-1 {
    color: #69cb69 !important;
    caret-color: #69cb69 !important;
  }
  .v-application .success.darken-1 {
    background-color: #2d9437 !important;
    border-color: #2d9437 !important;
  }
  .v-application .success--text.text--darken-1 {
    color: #2d9437 !important;
    caret-color: #2d9437 !important;
  }
  .v-application .success.darken-2 {
    background-color: #00791e !important;
    border-color: #00791e !important;
  }
  .v-application .success--text.text--darken-2 {
    color: #00791e !important;
    caret-color: #00791e !important;
  }
  .v-application .success.darken-3 {
    background-color: #006000 !important;
    border-color: #006000 !important;
  }
  .v-application .success--text.text--darken-3 {
    color: #006000 !important;
    caret-color: #006000 !important;
  }
  .v-application .success.darken-4 {
    background-color: #004700 !important;
    border-color: #004700 !important;
  }
  .v-application .success--text.text--darken-4 {
    color: #004700 !important;
    caret-color: #004700 !important;
  }
  .v-application .warning {
    background-color: #fb8c00 !important;
    border-color: #fb8c00 !important;
  }
  .v-application .warning--text {
    color: #fb8c00 !important;
    caret-color: #fb8c00 !important;
  }
  .v-application .warning.lighten-5 {
    background-color: #ffff9e !important;
    border-color: #ffff9e !important;
  }
  .v-application .warning--text.text--lighten-5 {
    color: #ffff9e !important;
    caret-color: #ffff9e !important;
  }
  .v-application .warning.lighten-4 {
    background-color: #fffb82 !important;
    border-color: #fffb82 !important;
  }
  .v-application .warning--text.text--lighten-4 {
    color: #fffb82 !important;
    caret-color: #fffb82 !important;
  }
  .v-application .warning.lighten-3 {
    background-color: #ffdf67 !important;
    border-color: #ffdf67 !important;
  }
  .v-application .warning--text.text--lighten-3 {
    color: #ffdf67 !important;
    caret-color: #ffdf67 !important;
  }
  .v-application .warning.lighten-2 {
    background-color: #ffc24b !important;
    border-color: #ffc24b !important;
  }
  .v-application .warning--text.text--lighten-2 {
    color: #ffc24b !important;
    caret-color: #ffc24b !important;
  }
  .v-application .warning.lighten-1 {
    background-color: #ffa72d !important;
    border-color: #ffa72d !important;
  }
  .v-application .warning--text.text--lighten-1 {
    color: #ffa72d !important;
    caret-color: #ffa72d !important;
  }
  .v-application .warning.darken-1 {
    background-color: #db7200 !important;
    border-color: #db7200 !important;
  }
  .v-application .warning--text.text--darken-1 {
    color: #db7200 !important;
    caret-color: #db7200 !important;
  }
  .v-application .warning.darken-2 {
    background-color: #bb5900 !important;
    border-color: #bb5900 !important;
  }
  .v-application .warning--text.text--darken-2 {
    color: #bb5900 !important;
    caret-color: #bb5900 !important;
  }
  .v-application .warning.darken-3 {
    background-color: #9d4000 !important;
    border-color: #9d4000 !important;
  }
  .v-application .warning--text.text--darken-3 {
    color: #9d4000 !important;
    caret-color: #9d4000 !important;
  }
  .v-application .warning.darken-4 {
    background-color: #802700 !important;
    border-color: #802700 !important;
  }
  .v-application .warning--text.text--darken-4 {
    color: #802700 !important;
    caret-color: #802700 !important;
  }
</style>

