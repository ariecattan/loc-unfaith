<template>
  <v-container pt-0>
    <v-container>
      <v-row>
        <v-sheet rounded="lg">
          <v-container fluid>
            <span
              v-for="token in summary"
              :key="token.id"
              :class="getTokenClass(token)"
              @click="selectSpan($event, token)"
            >
              {{ token.text }}
            </span>
          </v-container>
        </v-sheet>
      </v-row>
    </v-container>

    <v-container class="text-center">
      <v-btn class="mx-2" fab dark small color="success" @click="addPositive()">
        <v-icon dark> mdi-plus </v-icon>
      </v-btn>

      <v-btn class="mx-2" fab dark small color="error" @click="addNegative()">
        <v-icon dark> mdi-minus </v-icon>
      </v-btn>
    </v-container>

   
    <v-container fluid>
      <v-row>
        <v-col>
          <v-sheet elevation="10" rounded="xl">
            <v-sheet class="pa-1 success text-center" dark rounded="t-xl">
              Covered Spans
            </v-sheet>

            <div class="pa-4">
              <v-chip-group active-class="success--text" column>
                <v-chip v-for="item in Array.from(this.positiveList).sort(
                (a, b) => a - b
              )"
              :key="item"
              @click="selectNode(item)">
              {{
                summary
                  .slice(spans[item].start, spans[item].end)
                  .map((x) => x.text)
                  .join(" ")
              }}
                </v-chip>
              </v-chip-group>
            </div>
          </v-sheet>
        </v-col>
        <v-col>
        <v-sheet elevation="10" rounded="xl">
          <v-sheet class="pa-1 error text-center" dark rounded="t-xl">
            Hallucinated Spans
          </v-sheet>

          <div class="pa-4">
            <v-chip-group active-class="error--text" column>
              <v-chip v-for="item in Array.from(this.negativeList).sort(
                (a, b) => a - b
              )"
              :key="item"
              @click="selectNode(item)"
              >
              {{
                summary
                  .slice(spans[item].start, spans[item].end)
                  .map((x) => x.text)
                  .join(" ")
              }}
                </v-chip>
            </v-chip-group>
          </div>
        </v-sheet>
      </v-col>
        
      </v-row>
    </v-container>
  </v-container>
</template>

<script>
export default {
  name: "NodeLevel",
  props: {
    summary: Array,
    spans: Array,
  },
  data: function () {
    return {
      curMentionIndex: 0,
      mentionsViewed: 0,
      mentions: this.spans,
      viewedIndexes: new Set(),
      positiveList: new Set(),
      negativeList: new Set(),
      done: false,
    };
  },

  computed: {
    predicates: function() {
      return this.spans.filter(x => x.predicate);
    },
    curMention: function () {
      let curMention = this.spans[this.curMentionIndex];
      this.$emit("selectMention", curMention);
      return curMention;
    },
  },
  methods: {
    getTokenClass: function (token) {
      if (token.id >= this.curMention.start && token.id < this.curMention.end) {
        return "current";
      } else if (this.viewedIndexes.has(token.id)) {
        return "mention";
      }

      return "token";
    },
    addPositive: function () {
      this.positiveList.add(this.curMentionIndex);
      this.negativeList.delete(this.curMentionIndex);
      this.$emit("assignPositive", this.curMentionIndex);
      this.$forceUpdate();
      this.updateCounters();
    },
    addNegative: function () {
      this.negativeList.add(this.curMentionIndex);
      this.positiveList.delete(this.curMentionIndex);
      this.$emit("assignNegative", this.curMentionIndex);
      this.$forceUpdate();
      this.updateCounters();
    },
    updateCounters: function () {
      for (
        let index = this.curMention.start;
        index < this.curMention.end;
        index++
      ) {
        this.viewedIndexes.add(index);
      }
      this.mentionsViewed = Math.max(
        this.mentionsViewed,
        this.curMentionIndex + 1
      );
      this.curMentionIndex = Math.min(
        this.mentionsViewed,
        this.spans.length - 1
      );
      if (this.mentionsViewed == this.spans.length) {
        this.done = true;
      }
      this.$emit("updateNegativeSpans", this.negativeList);
    },
    selectSpan(event, token) {
      if (token.spans.length > 0 && token.spans[0] < this.mentionsViewed) {
        this.curMentionIndex = token.spans[0];
      }
    },
    selectNode(item) {
      this.curMentionIndex = item;
    },
    nextStep() {
      this.$emit("nextStep");
    },
  },
};
</script>

<style>
.current {
  background: #ddeff9;
  color: #2d9cdb;
}
.mention:hover {
  font-weight: medium;
  color: #b16a00;
}
.arie {
  color: #5da4ce;
}
.token:hover {
  background-color: #ffffb8;
}
.selectedSpan.v-list-item {
  background-color: #2d9cdb;
}
</style>