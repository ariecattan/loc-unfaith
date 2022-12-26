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

    <v-container class="my-2">
    <v-row>
    <v-spacer />
    <span >Node {{this.nodes.filter(x => this.viewedNodes.includes(x.id)).length + 1}}/{{nodes.length}}</span>  
      
    </v-row>
  </v-container>
      <v-card 
      v-for="question in this.curQuestions"
        :key="question.id"
        outlined 
        rounded="green"
        class="my-2"
        @mouseover="selectQA(question)"    
        @click="groupQA(questions)"
      >
        <v-row>
          <v-col cols="9" >
            <v-card-text class="subtitle-1 ">
              {{ question.question + " " }}
              <span  v-if="curQAIndex == question.id" class="answer">{{
                question.answer
              }}</span>
              <span v-else>{{ question.answer }}</span>
            </v-card-text>
          </v-col>
        </v-row>
      </v-card>

      <div class="text-center">
      <v-btn
        class="ma-2"
        outlined
        plain
        @click="previousNode()"
        :disabled="viewedNodes.length == 0"
      >
        Previous Predicate
      </v-btn>
      <v-btn
        class="ma-2"
        outlined
        plain
        @click="nextNode()"
        :disabled="!this.showNextNode()"
      >
        Next Predicate
      </v-btn>
    </div>
      
      <v-row justify="space-between" class="my-6">
        <v-btn
          :class="['ma-3','white--text']"
          color="#54a2f9" 
          @click="previousStep()"
        >
        <v-icon > mdi-arrow-left</v-icon> Previous Step 
        </v-btn>
        <v-btn class="ma-3"
          depressed 
          color="success" 
          @click="finish()"
        >
          Finish 
        </v-btn>
      </v-row>
    
  </v-container>
</template>

<script>
export default {
  name: "SplitLevel",
  props: {
    summary: Array,
    spans: Array,
    qas: Array,
    negativeSpans: Array
  },
  data: function() {
    const data = new Object();
    data.viewedNodes = [];
    data.curQAIndex = 0;
    data.curQuestion = '';
    data.curAnswers = new Set();
    return data;
  },
  computed: {
    nodes: function() {
      // nodes that are connected to multiple positive QAs
      return this.spans.filter(x => !this.negativeSpans.includes(x.id) && 
                    x.qaIds.filter(qa => 'label' in this.qas[qa] && this.qas[qa].label == 0).length > 1);
    },
    remainingNodes: function() {
      return this.nodes.filter(x => !this.viewedNodes.includes(x.id));
    },
    curNode: function() {
      return this.remainingNodes.length > 0 ? this.remainingNodes[0]: {};
    },
    curQuestions: function() {
      return 'qaIds' in this.curNode ? 
          this.curNode.qaIds.filter(qa => 'label' in this.qas[qa] && this.qas[qa].label == 0)
          .sort((a, b) => a.answerStartChart - b.answerEndChart).map(qa => this.qas[qa]) :
          [];
    }
  },
  methods: {
    getTokenClass: function(token) {
      if ('start' in this.curNode && token.id >= this.curNode.start && token.id < this.curNode.end) {
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
    previousNode: function() {
      this.viewedNodes.pop();
    },
    nextNode: function() {
      this.viewedNodes.push(this.curNode.id);
    },
    showNextNode: function() {
      return this.remainingNodes.length > 1;
    },
    previousStep: function() {
      this.$emit("previousStep")
    },
    finish: function() {
      this.$emit("finish");
    }
  }
};
</script>

<style>
</style>