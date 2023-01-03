<template>
  <v-container mx-0 mt-0 pt-0>
    <v-container>
      <v-row>
        <v-sheet rounded="lg">
          <v-container fluid>
            <span
              v-for="token in this.summary"
              :key="token.id"
              :class="getTokenClass(token)"
            >
              {{ token.text }}
            </span>
          </v-container>
        </v-sheet>
      </v-row>
    </v-container>

    <!-- <v-container>
      <div style="text-align: right">
        <span
          >Predicate
          {{
            this.predicates.filter((x) => this.viewedPredicates.includes(x.id))
              .length + 1
          }}/{{ predicates.length }} &nbsp;&nbsp; Question
          {{
            goodQAs.filter((qa) => "label" in qa && qa.label != null).length
          }}/{{ goodQAs.length }}</span
        >
      </div>
    </v-container> -->

    <v-container>
      <v-card
        v-for="question in this.curQuestions"
        :key="question.id"
        outlined
        rounded="green"
        class="my-2"
        @mouseover="selectQA(question)"
      >
        <v-row>
          <v-col cols="9">
            <v-card-text class="subtitle-1">
              {{ question.question + " " }}
              <span v-if="curQAIndex == question.id" class="answer">{{
                question.answer
              }}</span>
              <span v-else>{{ question.answer }}</span>
            </v-card-text>
          </v-col>
          <v-col cols="3">
            <v-card-actions>
              <v-btn-toggle tile group v-model="question.label">
                <v-btn color="success" icon>
                  <v-icon color="success">mdi-thumb-up</v-icon>
                </v-btn>
                <v-btn icon color="red">
                  <v-icon color="red">mdi-thumb-down</v-icon>
                </v-btn>
              </v-btn-toggle>
            </v-card-actions>
          </v-col>
        </v-row>
      </v-card>

      <div style="text-align: center">
        <span
          >Predicate
          {{
            this.predicates.filter((x) => this.viewedPredicates.includes(x.id))
              .length + 1
          }}/{{ predicates.length }} &nbsp;&nbsp; Question
          {{
            goodQAs.filter((qa) => "label" in qa && qa.label != null).length
          }}/{{ goodQAs.length }}</span
        >
      </div>

      <div class="text-center">
        <v-btn
          class="ma-2"
          outlined
          plain
          @click="previousPredicate()"
          :disabled="viewedPredicates.length == 0"
        >
          Previous Predicate
        </v-btn>
        <v-btn
          class="ma-2"
          outlined
          plain
          @click="nextPredicate()"
          :disabled="!this.showNextPredicate()"
        >
          Next Predicate
        </v-btn>
      </div>

      <v-switch
      v-model="showAllQAs"
      label="Show all QAs (so far)"
    ></v-switch>

      <v-card class="mt-6" v-show="showAllQAs"> 
        <v-card-title class="justify-center">Faithful QAs</v-card-title>

        <v-list-item
          dense
          v-for="item in this.qas.filter(
            (qa) => !this.filteredQAIds.has(qa.id) && qa.label == 0
          )"
          :key="item.id"
          @mouseover="selectQA(item)"
        >
          {{ item.question + "-" + item.answer }}
        </v-list-item>
      </v-card>

      <v-card class="my-2" v-show="showAllQAs">
        <v-card-title class="justify-center">Unfaithful QAs</v-card-title>

        <v-list-item
          dense
          v-for="item in this.qas.filter(
            (qa) => !this.filteredQAIds.has(qa.id) && qa.label == 1
          )"
          :key="item.id"
          @mouseover="selectQA(item)"
        >
          {{ item.question + "-" + item.answer }}
        </v-list-item>
      </v-card>
      <!-- <v-row justify="space-between" class="my-6">
        <v-btn
          :class="['ma-3','white--text']"
          color="#54a2f9" 
          @click="previousStep()"
        >
        <v-icon > mdi-arrow-left</v-icon> Previous Step 
        </v-btn>
     
        <v-btn
          :class="['ma-3','white--text']"
          color="#54a2f9" 
          @click="nextStep()"
          :disabled="!this.qas.filter(x => !this.filteredQAIds.has(x.id)).every(qa => 'label' in qa && qa.label != null)"
        >
          Next Step <v-icon > mdi-arrow-right</v-icon> 
        </v-btn>
      </v-row> -->
    </v-container>
  </v-container>
</template>

<script>
export default {
  name: "QA",
  props: {
    summary: Array,
    spans: Array,
    qas: Array,
    negativeSpans: Array,
  },
  data: function () {
    const data = new Object();
    data.viewedPredicates = [];
    data.curQAIndex = 0;
    data.curQuestion = "";
    data.curAnswers = new Set();
    data.showAllQAs = false;
    return data;
  },

  computed: {
    predicates: {
      cache: false,
      deep: true,
      get() {
        return this.spans.filter(
        (x) => x.predicate && !this.negativeSpans.includes(x.id)
        // x => x.predicate && !('label' in x && x.label == 0)
      );
      }
    },
    remainingPredicates: function () {
      return this.predicates.filter(
        (x) => !this.viewedPredicates.includes(x.id)
      );
    },
    curPredicate: function () {
      return this.remainingPredicates[0];
    },
    filteredQAIds: function () {
      let filteredQAIds = new Set();
      this.negativeSpans.forEach((spanId) =>
        this.spans[spanId].qaIds.forEach((qaId) => {
          filteredQAIds.add(qaId);
        })
      );
      return filteredQAIds;
    },
    goodQAs: function () {
      return this.qas.filter((qa) => !this.filteredQAIds.has(qa.id));
    },
    filteredViewedPredicates: function () {
      let predicateIds = this.predicates.map((x) => x.id);
      return this.viewedPredicates.filter((x) => predicateIds.includes(x));
    },
    curMentionIndex: function () {
      return this.predicates.findIndex((x) => x.id == this.curPredicate.id);
    },
    curPredicateIdx: function () {
      return this.curPredicate.start + "-" + this.curPredicate.end;
    },
    curQuestions: function () {
      return this.qas
        .filter(
          (x) =>
            x.predicateId == this.curPredicateIdx &&
            !this.filteredQAIds.has(x.id)
        )
        .sort((a, b) => a.answerStartChar - b.answerEndChar);
    },
  },
  methods: {
    getTokenClass: function (token) {
      if (
        token.id >= this.curPredicate.start &&
        token.id < this.curPredicate.end
      ) {
        return "predicate";
      } else if (this.curAnswers.has(token.id)) {
        return "answer";
      }

      return "token";
    },

    compareNumbers: function (a, b) {
      return a - b;
    },
    selectQA: function (item) {
      this.curQAIndex = item.id;
      this.curQuestion = this.qas[item.id];

      this.curAnswers = new Set();
      let answers = this.curQuestion.answerStartToken.map((token, i) => [
        token,
        this.curQuestion.answerEndToken[i],
      ]);
      answers.forEach((element) => {
        for (let index = element[0]; index < element[1]; index++) {
          this.curAnswers.add(index);
        }
      });
      this.$emit("selectAnswers", this.curAnswers);
      this.$emit("selectMention", this.curPredicate);
    },
    groupBy(xs, key) {
      return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      }, {});
    },
    previousPredicate: function () {
      this.viewedPredicates.pop();
    },
    nextPredicate: function () {
      this.viewedPredicates.push(this.curPredicate.id);
    },

    nextStep: function () {
      this.$emit("nextStep");
    },
    previousStep: function () {
      this.$emit("previousStep");
    },
    showPreviousPredicate: function () {
      return this.viewedPredicates.length > 0;
    },
    showNextPredicate: function () {
      return (
        this.remainingPredicates.length > 1 &&
        this.curQuestions.every((qa) => "label" in qa && qa.label != null)
      );
    },
  },
};
</script>

<style>
.predicate {
  background: #ddeff9;
  color: #2d9cdb;
  font-weight: 600;
}
.mention:hover {
  font-weight: medium;
  color: #b16a00;
}
.token:hover {
  background-color: #ffffb8;
}
.answer {
  background: #faf2c6d5;
  color: #544e2dfc;
}
.theme--light.v-card.v-card--disabled:not(.v-card--flat):not(.v-card--text) {
  background-color: rgba(203, 203, 203, 0.999) !important;
}
.border.v-row {
  border-width: 10px;
  border-color: #2d9cdb;
}
</style>