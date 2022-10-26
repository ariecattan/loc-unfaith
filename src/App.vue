<template>
  <v-app id="inspire">
    <v-app-bar app color="white" flat>
      <v-avatar
        :color="$vuetify.breakpoint.smAndDown ? 'grey darken-1' : 'transparent'"
        size="32"
      ></v-avatar>

      <v-tabs centered class="ml-n9" color="grey darken-1">
        <v-tab v-for="link in links" :key="link">
          {{ link }}
        </v-tab>
      </v-tabs>

      <v-avatar
        class="hidden-sm-and-down"
        color="grey darken-1 shrink"
        size="32"
      ></v-avatar>
    </v-app-bar>

    <v-main class="grey lighten-3">
      <v-container>
        <v-row>
          <v-col cols="12" sm="5">
            <v-container>
              <v-row>
                <v-sheet rounded="lg">
                  <v-container fluid>
                    <span v-for="token in this.source" :key="token.id"
                      >{{ token.text }}
                    </span>
                  </v-container>

                  <!--  -->
                </v-sheet>
              </v-row>
            </v-container>
          </v-col>
          <v-col cols="12" sm="7">
            <v-container>
              <v-row>
                <v-sheet rounded="lg">
                  <v-container fluid mb-3 mt-3>
                    <span
                      v-for="(tokenSpan, spanIndex) in summaryView"
                      :key="spanIndex"
                      ref="mentions"
                    >
                      <span
                        v-if="!tokenSpan.tokens"
                        :id="'token-' + tokenSpan.i"
                        class="token"
                        v-text="tokenSpan.text"
                      />
                      <span
                        v-for="token in tokenSpan.tokens"
                        v-else
                        :id="'token-' + token.i"
                        :key="token.i"
                        :class="tokenSpan.class"
                        v-text="token.text"
                      />
                    </span>
                  </v-container>
                  <!--  -->
                </v-sheet>
              </v-row>
            </v-container>

            <v-container class="text-center">
              <v-btn
                class="mx-2"
                fab
                dark
                small
                color="primary"
                @click="addPositive()"
              >
                <v-icon dark> mdi-plus </v-icon>
              </v-btn>

              <v-btn
                class="mx-2"
                fab
                dark
                small
                color="pink"
                @click="addNegative()"
              >
                <v-icon dark> mdi-minus </v-icon>
              </v-btn>
            </v-container>

            <v-container fluid>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-card>
                    <v-card-title class="justify-center"
                      >Existing Spans</v-card-title
                    >

                    <v-list-item
                      dense
                      v-for="item in this.positiveList"
                      :key="item"
                    >
                      {{ item.text }}
                    </v-list-item>
                  </v-card>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-card >
                    <v-card-title class="justify-center"
                      >Hallucinated Spans</v-card-title
                    >
                    <v-card-text>
                    <v-list dense>
                      <v-list-item-group>
                        <v-list-item
                          v-for="item in this.negativeList"
                          :key="item"
                        >
                          {{ item.text }}
                        </v-list-item>
                      </v-list-item-group>
                    </v-list>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import jsonData from "./data/example.json";
// import NodeLevel from "./components/NodeLevel.vue"

export default {
  name: "App",

  components: {
    // NodeLevel
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
    data.curMentionIndex = 0;
    data.mentionsViewed = 0;
    this.positiveList = [];
    this.negativeList = [];
    data.links = ["Overview", "Span", "QAs", "Global"];
    return data;
  },
  computed: {
    positives: function () {
      return this.positiveList;
    },
    negatives: function () {
      return this.negativeList;
    },
    summaryView: function () {
      // for each document
      let docSpans = [];
      let mentInd = 0;

      docSpans.push(...this.summary.slice(0, this.spans[0].start));
      for (let index = 0; index < this.spans.length; index++) {
        let mention = this.spans[index];
        console.log(mention.text);
        let mentionSpan = {
          tokens: this.summary.slice(mention.start, mention.end),
          index: mentInd,
        };
        if (mentInd == this.curMentionIndex) {
          mentionSpan.class = "current";
        } else if (mentInd < this.curMentionIndex) {
          mentionSpan.class = "viewed";
        } else {
          mentionSpan.class = "future";
        }

        docSpans.push(mentionSpan);
        mentInd += 1;

        if (index < this.spans.length - 1) {
          docSpans.push(
            ...this.summary.slice(mention.end, this.spans[index + 1].start)
          );
        }
      }

      docSpans.push(
        ...this.summary.slice(
          this.spans[this.spans.length - 1].end,
          this.summary.length
        )
      );
      return docSpans;
    },
  },
  methods: {
    addPositive: function () {
      this.positiveList.push(this.spans[this.curMentionIndex]);
      this.curMentionIndex += 1;
    },
    addNegative: function () {
      this.negativeList.push(this.spans[this.curMentionIndex]);
      this.curMentionIndex += 1;
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