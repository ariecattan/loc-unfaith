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

          <v-divider></v-divider>

          <v-stepper-step step="3"> Group </v-stepper-step>
        </v-stepper-header>

        <v-stepper-items>
          <!-- Node -->
          <v-stepper-content step="1">
            <v-row>
              <v-col cols="12" sm="5">
                <SourceArticle
                  :source="this.source"
                  :mention="currentSpan"
                  :answer="currentAnswer"
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
              </v-col>
            </v-row>

            <div style="text-align: right">
              <v-btn
                color="primary"
                @click="e1 = 2"
                :disabled="!this.answers.every((x) => 'label' in x)"
              >
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
                <QA
                  :summary="summary"
                  :qas="qas"
                  :predicates="predicates"
                  :answers="answers"
                  :negativeSpans="Array.from(negativeSpans)"
                  @selectMention="selectPredicate($event)"
                  @selectAnswers="selectAnswers($event)"
                  @nextStep="nextStep()"
                  @previousStep="previousStep()"
                ></QA>
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
                @click="e1 = 3"
              >
                Next Step <v-icon> mdi-arrow-right</v-icon>
              </v-btn>
            </v-row>
          </v-stepper-content>

          <v-stepper-content step="3">
            <v-row>
              <v-col cols="12" sm="5">
                <SourceArticle
                  :source="this.source"
                  :mention="currentSpan"
                  :answer="currentAnswer"
                ></SourceArticle>
              </v-col>
              <v-col>
                <SplitLevel
                  :summary="summary"
                  :spans="spans"
                  :qas="qas"
                  :negativeSpans="Array.from(negativeSpans)"
                  @selectMention="selectPredicate($event)"
                  @selectAnswers="selectAnswers($event)"
                  @previousStep="previousStep()"
                  @finish="finish()"
                ></SplitLevel>
              </v-col>
            </v-row>

            <v-row justify="space-between">
              <v-btn
                :class="['ma-3', 'white--text']"
                color="primary"
                @click="e1 = 2"
              >
                <v-icon> mdi-arrow-left</v-icon> Previous Step
              </v-btn>

              <v-btn
                :class="['ma-3', 'white--text']"
                color="primary"
                @click="e1 = 3"
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
import jsonData from "./data/annotation_files/0ceb4cea35c3e964a2e54ec9715de42e1319fd03.json";
// import jsonData from "./data/annotation_files/69db30b6047a2aadd64f3c6eeb23cc3437078cf1.json"
import NodeLevel from "./components/NodeLevel.vue";
import SourceArticle from "./components/SourceArticle.vue";
import QA from "./components/QA.vue";
import SplitLevel from "./components/Split.vue";

export default {
  name: "App",

  components: {
    SourceArticle,
    NodeLevel,
    QA,
    SplitLevel,
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
    data.tabs = [
      { index: 0, name: "Span" },
      { index: 1, name: "QA" },
      { index: 2, name: "Split" },
    ];
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
    data.filteredPredicates = data.spans.filter((x) => x.predicate);
    return data;
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
      // negativeSpans.forEach((spanId) => {
      //   this.spans[spanId].qaIds.forEach((qaId) => filteredQAIds.add(qaId));
      // });
      this.filteredLocalQAs = this.qas.filter((x) => !filteredQAIds.has(x.id));
    },
    nextStep: function () {
      this.selectedTabIndex += 1;
    },
    previousStep: function () {
      this.selectedTabIndex -= 1;
    },
    finish: function () {
      this.done = true;
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
  },
};
</script>

<style>
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