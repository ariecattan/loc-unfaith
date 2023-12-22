<template>
  <v-container>
    <v-row>
      <v-sheet rounded="lg">
        <v-container fluid>
          <span v-for="token in this.source" 
          :key="token.id"
          :class="getTokenClass(token)"
            >{{ token.text }}
          </span>
        </v-container>
      </v-sheet>
    </v-row>
  </v-container>
</template>

<script>
import {
  VSheet,
  VContainer,
  VRow
} from "vuetify/lib";

export default {
  name: "SourceArticle",
  components: {
    VSheet,
    VContainer,
    VRow
  },
  props: {
    source: Array,
    highlightedSpans: Array,  // 1st step and predicate in 2nd step
    highlightedAnswers: Array // for answer in 2nd step
  },
  computed: {
    // sourceLemma: function() {
    //   return this.source.map(x => x.lemma)
    // },
    // matchedMention: function() {
    //   let spanTokens = this.mention.map(x => x.lemma);
    //   return this.findAllMatchedTokens(this.sourceLemma, spanTokens);
    // },
    // matchedAnswer: function() {
    //   if (this.answer == undefined || this.answer.length == 0) {
    //     return [];
    //   }
    //   let answerTokens = this.answer.map(x => x.text);      
      
    //   return this.findAllMatchedTokens(this.sourceLemma, answerTokens);
    // }
    // matchedToken: function() {      
    //   let sourceTokens = this.source.map(x => x.lemma);
    //   let spanTokens = this.spans.map(x => x.lemma);

    //   let startingIndexes = [];
    //   for (let i = 0; i < sourceTokens.length; i++) {
    //     const token = sourceTokens[i];
    //     if (token == spanTokens[0]) {
    //       startingIndexes.push(i);
    //     }
    //   }
      
    //   let allIndexes = [];

    //   startingIndexes.forEach(start => {
    //     let flag = true;
    //     let candidateIndexes = [];
    //     for (let i = 0; i < spanTokens.length; i++) {
    //       const token = spanTokens[i];
    //       candidateIndexes.push(start + i);
    //       if (start + i >= sourceTokens.length || token != sourceTokens[start + i]) {
    //         flag = false;
    //         break
    //       }
    //     }
    //     if (flag) {
    //       candidateIndexes.forEach(x => allIndexes.push(x));
    //     } 
    //   });
      
    //   return allIndexes;
    // }
  },
  methods: {
    findStartingTokens(array, subarray) {
      let startingIndexes = [];
      for (let i = 0; i < array.length; i++) {
        const token = array[i];
        if (token == subarray[0]) {
          startingIndexes.push(i);
        }
      }
      return startingIndexes;
    },
    findAllMatchedTokens(array, subarray) {
      let allIndexes = [];
      let startingIndexes = this.findStartingTokens(array, subarray);
      startingIndexes.forEach(start => {
        let flag = true;
        let candidateIndexes = [];
        for (let i = 0; i < subarray.length; i++) {
          const token = subarray[i];
          candidateIndexes.push(start + i);
          if (start + i >= array.length || token != array[start + i]) {
            flag = false;
            break
          }
        }
        if (flag) {
          candidateIndexes.forEach(x => allIndexes.push(x));
        } 
      });
      return allIndexes;
    },
    getTokenClass: function (token) {
      if (this.highlightedSpans.includes(token.id)) {
        return "current";
      } else if (this.highlightedAnswers.includes(token.id)) {
        return "answer";
      }
      return "token";
    },
  }
};
</script>

<style>
</style>