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
          <v-col v-show="curNode.global">
            <v-card-actions>
              <v-chip-group v-model="question.group" active-class="primary--text" >
                <v-chip   v-for="index in groupNumber" :key="'btn-'+index">
                  {{index}}
                </v-chip>
              </v-chip-group>
            </v-card-actions>
          </v-col>
        </v-row>
      </v-card>

      <v-container>
      <span>Do these QAs refer to the same instance of the "{{curNodeText}}" in the source document? </span>
      <v-btn-toggle tile group v-model="curNode.global">
        <v-btn outlined color="success">
          Yes
          <v-icon color="success">mdi-thumb-up</v-icon>
        </v-btn>
        <v-btn outlined color="red">
          No
          <v-icon color="red">mdi-thumb-down</v-icon>
        </v-btn>
      </v-btn-toggle>
      
      <v-spacer/>
      
      <v-container v-show="curNode.global">

      
      <v-combobox v-model="groupNumber"
                  :items="[1,2,3,4]"
                  label="How many groups?"
                  small
                  >
      </v-combobox>
      
      <!-- <v-sheet
        elevation="5"
        rounded="xl"
        class="my-3"
        v-for="index in groupNumber" 
        :key="'group-' + index"
      >
      <v-sheet
          class="pa-3 primary text-center"
          dark
          rounded="t-xl"
        >
        Group {{index}}
      </v-sheet>
        <div class="pa-4">
          <v-chip-group
            active-class="primary--text"
            column
          >
            <v-chip
              v-for="tag in [1,2,3,4,5]"
              :key="index + '-' + tag"
            >
              {{ tag }}
            </v-chip>
          </v-chip-group>
        </div>
      </v-sheet> -->
    </v-container>

      <div style="text-align: center">
        <span
          >Node
          {{
            this.nodes.filter((x) => this.viewedNodes.includes(x.id)).length +
            1
          }}/{{ nodes.length }}</span
        >
      </div>

      <div class="text-center">
        <v-btn
          class="ma-2"
          outlined
          plain
          @click="previousNode()"
          :disabled="viewedNodes.length == 0"
        >
          Previous Node
        </v-btn>
        <v-btn
          class="ma-2"
          outlined
          plain
          @click="nextNode()"
          :disabled="!this.showNextNode()"
        >
          Next Node
        </v-btn>
      </div>
    </v-container>
  </v-container>
</template>

<script>
export default {
  name: "SplitLevel",
  props: {
    summary: Array,
    spans: Array,
    qas: Array,
    negativeSpans: Array,
  },
  data: function () {
    const data = new Object();
    data.viewedNodes = [];
    data.curQAIndex = null;
    data.curQuestion = "";
    data.curAnswers = new Set();
    data.groupNumber = 2;
    return data;
  },
  computed: {
    nodes: function () {
      // nodes that are connected to multiple positive QAs
      return this.spans.filter(
        (x) =>
          !this.negativeSpans.includes(x.id) &&
          x.qaIds.filter(
            (qa) => "label" in this.qas[qa] && this.qas[qa].label == 0
          ).length > 1
      );
    },
    remainingNodes: function () {
      return this.nodes.filter((x) => !this.viewedNodes.includes(x.id));
    },
    curNode: function () {
      return this.remainingNodes.length > 0 ? this.remainingNodes[0] : {};
    },
    curNodeText: function() {
      return this.summary.slice(this.curNode.start, this.curNode.end)
                    .map(x => x.text)
                    .join(" ");
    },
    curQuestions: function () {
      return "qaIds" in this.curNode
        ? this.curNode.qaIds
            .filter((qa) => "label" in this.qas[qa] && this.qas[qa].label == 0)
            .sort((a, b) => a.answerStartChart - b.answerEndChart)
            .map((qa) => this.qas[qa])
        : [];
    },
  },
  methods: {
    getTokenClass: function (token) {
      if (
        "start" in this.curNode &&
        token.id >= this.curNode.start &&
        token.id < this.curNode.end
      ) {
        return "current";
      } else if (this.curAnswers.has(token.id)) {
        return "answer";
      }
      return "token";
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
      this.$emit("selectMention", this.curNode);
    },
    previousNode: function () {
      this.viewedNodes.pop();
    },
    nextNode: function () {
      this.viewedNodes.push(this.curNode.id);
    },
    showNextNode: function () {
      return this.remainingNodes.length > 1;
    },
    previousStep: function () {
      this.$emit("previousStep");
    },
    finish: function () {
      this.$emit("finish");
    },
  },
};
</script>

<style>

</style>