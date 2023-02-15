<template>
  <v-container mx-0 mt-0 pt-0>
    <v-container>
      <v-card>
        <v-card-title>Instructions</v-card-title>
        <v-card-text>
          

        Here, we decompose the summary information into a list of question-answer (QA) pairs,
        where each QA corresponds to a relation between a <span class="current">predicate</span>
        and an <span class="answer">argument</span>. 
        For each QA, click on <v-btn class="disable-events" x-small color="success" icon elevation="0">
                  <v-icon color="success">mdi-thumb-up</v-icon>
                </v-btn> if it's covered by the source document 
          and on <v-btn class="disable-events" x-small color="error" icon elevation="0">
                  <v-icon color="error">mdi-thumb-down</v-icon>
                </v-btn>
          if the relation cannot be implied from the source document. 
        
          <br/>
          If the QAs pairs are implied from different events in the source document, 
          click on <v-btn class="disable-events" x-small fab dark color="success" width="20px" height="20px" elevation="0">
          <v-icon dark> mdi-plus </v-icon>
        </v-btn>
                to create a new cluster and drag-and-drop the QA in their corresponding clusters.
        
      
        </v-card-text>
      </v-card>


     
    </v-container>

    <v-container>
      <v-row>
        <v-sheet rounded="lg">
          <v-container fluid>
            <span
              v-for="token in this.summary"
              :key="token.id"
              :class="getTokenClass(token)"
              @click="selectSpan($event, token)"
              v-text="getToken(token)"
            >
            </span>
          </v-container>
        </v-sheet>
      </v-row>
    </v-container>

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
              <v-btn-toggle
                tile
                group
                v-model="question.label"
                @change="updateCoveredQAs()"
              >
                <v-btn color="success" icon>
                  <v-icon color="success">mdi-thumb-up</v-icon>
                </v-btn>
                <v-btn icon color="error">
                  <v-icon color="error">mdi-thumb-down</v-icon>
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

      <v-sheet
        v-for="(cluster, clusterIndex) in positiveQAs[curPredicate.id]"
        :key="'cluster-' + clusterIndex"
        class="my-2"
        elevation="10"
        rounded="xl"
        v-show="curQuestions.length > 0"
      >
        <v-sheet class="pa-1 success text-center" dark rounded="t-xl">
          Covered QAs
          {{
            positiveQAs[curPredicate.id].length > 1 ? "(cluster " + (clusterIndex + 1) + ")" : ""
          }}

          <v-btn
            icon
            :disabled="cluster.length > 0 || clusterIndex == 0"
            @click="removeCluster()"
          >
            <v-icon >mdi-close-circle</v-icon>
          </v-btn>
        </v-sheet>

        <div class="pa-4">
          <v-chip-group class="fixed-height" active-class="success--text" column>
            <draggable
              :list="cluster"
              group="clusters"
              :emptyInsertThreshold="500"
            >
              <v-chip v-for="qa in cluster" :key="qa.id" @click="selectQA(qa)">
                {{ qa.question + " " + qa.answer }}
              </v-chip>
            </draggable>
          </v-chip-group>
        </div>
      </v-sheet>

      <v-btn class="my-2" fab dark small color="success" @click="addCluster()"
      v-show="curQuestions.length > 0">
        <v-icon dark> mdi-plus </v-icon>
      </v-btn>

      <v-sheet 
        elevation="10" 
        rounded="xl" 
        v-show="curQuestions.length > 0">
        <v-sheet class="pa-1 my-2 error text-center" dark rounded="t-xl">
          Hallucinated QAs
        </v-sheet>

        <div class="pa-4">
          <v-chip-group active-class="error--text" column>
            <v-chip
              v-for="item in this.curQuestions.filter(
                (qa) => !this.filteredQAIds.has(qa.id) && qa.label == 1
              )"
              :key="item.id"
            >
              {{ item.question + " " + item.answer }}
            </v-chip>
          </v-chip-group>
        </div>
      </v-sheet>


      <div class="text-center my-4">
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
    </v-container>
  </v-container>
</template>

<script>
import {
  VSheet,
  VContainer,
  VRow,
  VCol,
  VCard,
  VIcon,
  VBtn,
  VChip,
  VChipGroup,
  VCardTitle,
  VCardText,
  VCardActions,
  VBtnToggle,
} from "vuetify/lib";

import draggable from "vuedraggable";

export default {
  name: "QALevel",
  components: {
    draggable,
    VSheet,
    VContainer,
    VRow,
    VCol,
    VCard,
    VIcon,
    VBtn,
    VChip,
    VChipGroup,
    VCardTitle,
    VCardText,
    VCardActions,
    VBtnToggle,
  },
  props: {
    summary: Array,
    qas: Array,
    negativeSpans: Array,
    predicates: Array,
    answers: Array,
    annotatedQAs: Object,
  },
  data: function () {
    const data = new Object();
    data.viewedPredicates = [];
    data.viewedQAs = [];

    data.positiveQAs = {};
    this.predicates.forEach(predicate => {
      if (this.annotatedQAs && predicate.id in this.annotatedQAs) {
        data.positiveQAs[predicate.id] = this.annotatedQAs[predicate.id]
      }
      else {
        data.positiveQAs[predicate.id] = [[]];
      }
      
    });

    data.curQAIndex = 0;
    data.curAnswers = new Set();

    return data;
  },
  watch: {
    negativeSpans: function() {
      this.updateCoveredQAs();
    }
  },
  computed: {
    filteredQAIds: function () {
      let filteredQAIds = new Set();

      this.negativeSpans.forEach((spanId) => {
        this.answers[spanId].qaIds.forEach((qaId) => {
          filteredQAIds.add(qaId);
        });
      });

      return filteredQAIds;
    },
    remainingPredicates: function () {
      return this.predicates.filter(
        (x) => !this.viewedPredicates.includes(x.id)
      );
    },
    curPredicate: function () {
      return this.remainingPredicates[0];
    },
    curPredicateId: function () {
      return this.getPredicateId(this.curPredicate);
    },
    curQuestions: function () {
      return this.qas
        .filter(
          (x) =>
            x.predicateId == this.curPredicateId &&
            !this.filteredQAIds.has(x.id)
        )
        .sort((a, b) => a.answerStartChar - b.answerEndChar);
    },
    remainingQAs: function () {
      return this.curQuestions.filter((x) => !this.viewedQAs.includes(x.id));
    },
    curQA: function () {
      return this.remainingQAs[0];
    },
    viewedPositiveQAs: function () {
      return this.viewedQAs.filter(
        (questionId) => this.qas[questionId].label == 1
      );
    },
    viewedNegativeQAs: function () {
      return this.viewedQAs.filter(
        (questionId) => this.qas[questionId].label == 0
      );
    },
    goodQAs: function () {
      return this.qas.filter((qa) => !this.filteredQAIds.has(qa.id));
    },
    positiveQACurrentPredicate: function() {
      return this.positiveQAs[this.curPredicate.id];
    }
  },
  methods: {
    getToken: function(token) {
      let tokenPrint = token.text;
      tokenPrint += token.noWhite ? "" : " ";
      return tokenPrint;
    },
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
    nextPredicate: function () {
      this.viewedQAs = [];
      this.viewedPredicates.push(this.curPredicate.id);
    },
    previousPredicate: function () {
      this.viewedQAs = [];
      this.viewedPredicates.pop();
    },
    showPreviousPredicate: function () {
      return (
        this.remainingPredicates.length > 1 &&
        this.curQuestions.every((qa) => "label" in qa && qa.label != null)
      );
    },
    nextQA: function () {
      this.viewedQAs.push(this.curQA.id);
    },
    updateCoveredQAs: function () {
      let allTruePositives = this.curQuestions.filter(
        (x) => "label" in x && x.label == 0
      );
      let allCurrentPositives = this.positiveQAs[this.curPredicate.id].flat();

      // remove false positives
      this.positiveQAs[this.curPredicate.id].forEach((cluster) => {
        cluster.forEach((qa, index) => {
          if (!allTruePositives.includes(qa)) {
            cluster.splice(index, 1);
          }
        });
      });

      // add true positives
      allTruePositives.forEach((qa) => {
        if (!allCurrentPositives.includes(qa)) {
          this.positiveQAs[this.curPredicate.id][0].push(qa);
        }
      });
    },
    addCluster: function () {
      this.positiveQAs[this.curPredicate.id].push([]);
    },
    removeCluster: function () {
      this.positiveQAs[this.curPredicate.id].splice(-1);
    },
    showNextPredicate: function () {
      return (
        this.remainingPredicates.length > 1 &&
        (this.curQuestions.length == 0 || 
        this.curQuestions.every((qa) => "label" in qa && qa.label != null))
      );
    },
    getPredicateId: function(predicate) {
      return predicate.start + "-" + predicate.end;
    },
    selectQA: function(qa) {
      this.curQAIndex = qa.id; 
      this.curAnswers = new Set();
      
      let answers = qa.answerStartToken.map((token, i) => [
        token, 
        qa.answerEndToken[i]  
      ]);

      answers.forEach((span) => {
        for (let index = span[0]; index < span[1]; index++) {
          this.curAnswers.add(index);
        }
      })

      this.$emit("selectAnswers", this.curAnswers);
      this.$emit("selectMention", this.curPredicate);
    }
  },
};
</script>

<style>
.predicate {
  background: #ddeff9;
  color: #2d9cdb;
  font-weight: 600;
}
.token:hover {
  background-color: #ffffb8;
}
.answer {
  background: #faf2c6d5;
  color: #544e2dfc;
}
.fixed-height {
  min-height: 20px;
}
.disable-events {
  pointer-events: none
}
</style>