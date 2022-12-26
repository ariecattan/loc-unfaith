<template>
  <v-app>
    <v-app-bar app color="white" flat>
      <v-avatar
        :color="$vuetify.breakpoint.smAndDown ? 'grey darken-1' : 'transparent'"
        size="32"
      ></v-avatar>

      <v-tabs
        centered
        class="ml-n9"
        color="grey darken-1"
        v-model="selectedTabIndex"
      >
        <v-tab v-for="tab in tabs" :key="tab.id">
          {{ tab.name }}
        </v-tab>
      </v-tabs>

      <v-avatar
        class="hidden-sm-and-down"
        color="grey darken-1 shrink"
        size="32"
      ></v-avatar>
    </v-app-bar>

    <v-main class="grey lighten-3">
      <v-container style="max-width: 1200px">
        <v-row>
          <v-col cols="12" sm="5">
            <SourceArticle :source="this.source"
              :mention="currentSpan"
              :answer="currentAnswer"
            ></SourceArticle>
          </v-col>

          <v-col cols="12" sm="7">
            <NodeLevel
              ref="node"
              v-show="this.selectedTabIndex == 0"
              :summary="summary"
              :spans="spans"
              @nextStep="nextStep()"
              @selectMention="selectMention($event)"
              @updateNegativeSpans="updateNegativeSpans($event)"
            ></NodeLevel>
            <QA
              v-show="this.selectedTabIndex == 1"
              :summary="summary"
              :spans="spans"
              :qas="qas"
              :negativeSpans="Array.from(negativeSpans)"

              @selectMention="selectPredicate($event)"
              @selectAnswers="selectAnswers($event)"
              @nextStep="nextStep()"
              @previousStep="previousStep()"
            ></QA>
            <SplitLevel
              v-show="this.selectedTabIndex == 2"
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
      </v-container>
    </v-main>

    <!-- <v-stepper v-model="e1">
      <v-stepper-header>
        <v-stepper-step :complete="e1 > 1" step="1"> Span </v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step :complete="e1 > 2" step="2">
          Question-Answer
        </v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step step="3"> Node Split </v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content step="1">


          <v-row>
            <v-col cols="12" sm="5">
              <SourceArticle :source="this.source"></SourceArticle>
            </v-col>
            <v-col cols="12" sm="7">
              <NodeLevel
                v-if="this.selectedTabIndex == 0"
                :summary="summary"
                :spans="spans"
              ></NodeLevel>
            </v-col>
          </v-row>

          <v-btn color="primary" @click="e1 = 2"> Continue </v-btn>
        </v-stepper-content>

        <v-stepper-content step="2">
          <v-card class="mb-12" color="grey lighten-1" height="200px"></v-card>

          <v-btn right color="primary" @click="e1 = 3"> Continue </v-btn>
        </v-stepper-content>

        <v-stepper-content step="3">
          <v-card class="mb-12" color="grey lighten-1" height="200px"></v-card>

          <v-btn color="success"> Finish </v-btn>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper> -->
  </v-app>
</template>

<script>
// import jsonData from "./data/example.json";
// import jsonData from "./data/annotation_files/10891591.json";
import jsonData from "./data/annotation_files/0ceb4cea35c3e964a2e54ec9715de42e1319fd03.json"
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
    data.negativeSpans = new Set();
    data.negativeQAs = new Set();
    data.filteredLocalQAs = data.qas;
    data.currentSpan = data.spans.slice(data.spans[0].start, data.spans[0].end + 1)
    data.currentAnswer = [];
    data.filteredPredicates = data.spans.filter((x) => x.predicate);
    return data;
  },
  methods: {
    filterQAs: function (set) {
      return this.qas.filter((x) => set.has(x.id));
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
    selectMention: function(span) {
      if (this.selectedTabIndex == 0) {
        this.currentSpan = this.summary.slice(span.start, span.end);
      }
    },
    selectPredicate: function(span) {
      if (this.selectedTabIndex != 0) {
        this.currentSpan = this.summary.slice(span.start, span.end);
      }
    },
    selectAnswers: function(tokenIndexes) {
      if (this.selectedTabIndex != 0) {
        this.currentAnswer = Array.from(tokenIndexes).sort((a, b) => a - b).map(x => this.summary[x]);
      } else {
        this.currentAnswer = [];
      }
      
    }
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