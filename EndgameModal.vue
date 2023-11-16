<template>
  <transition name="fade">
    <div class="endgame-modal" v-if="statsOpened">
      <div class="modal-backdrop" @click="closeModal"></div>
      <div class="endgame-modal-content" v-bind:class="{ 'finished' : finished}">
        <div class="close-btn" @click="closeModal">
          <img class="icon" src="/icons/close.svg" alt="Close" />
        </div>
        <h2>Statistiques</h2>
        <!-- Your modal content goes here -->
        <div class="answer-box" :class="{ 'correct': answerCorrect, 'incorrect': !answerCorrect }">
          <p v-if="answerCorrect">Emoji :tada: The answer is: {{ selectedPlayer.name }}</p>
          <p v-else>The answer was: {{ selectedPlayer.name }}</p>
          <button :class="{ 'btn-correct': answerCorrect, 'btn-incorrect': !answerCorrect }" @click="closeModal">Close</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    statsOpened: Boolean,
    finished: Boolean,
    answerCorrect: Boolean,
    selectedPlayer: Object,
  },
  methods: {
    closeModal() {
      this.$emit('close-modal');
    },
  },
};
</script>

<style scoped>
/* Your modal styles go here */
</style>

