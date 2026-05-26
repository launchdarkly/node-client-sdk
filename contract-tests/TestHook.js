let postChain = Promise.resolve();

function safePost(url, body) {
  postChain = postChain.then(() =>
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => {})
  );
}

class TestHook {
  constructor(name, endpoint, data, errors) {
    this.hookName = name;
    this.endpoint = endpoint;
    this.hookData = data || {};
    this.hookErrors = errors || {};
  }

  getMetadata() {
    return { name: this.hookName };
  }

  beforeEvaluation(hookContext, data) {
    if (this.hookErrors.beforeEvaluation) {
      throw new Error(this.hookErrors.beforeEvaluation);
    }
    safePost(this.endpoint, {
      evaluationSeriesContext: hookContext,
      evaluationSeriesData: data,
      stage: 'beforeEvaluation',
    });
    return { ...data, ...(this.hookData.beforeEvaluation || {}) };
  }

  afterEvaluation(hookContext, data, detail) {
    if (this.hookErrors.afterEvaluation) {
      throw new Error(this.hookErrors.afterEvaluation);
    }
    safePost(this.endpoint, {
      evaluationSeriesContext: hookContext,
      evaluationSeriesData: data,
      evaluationDetail: detail,
      stage: 'afterEvaluation',
    });
    return { ...data, ...(this.hookData.afterEvaluation || {}) };
  }

  afterTrack(hookContext) {
    if (this.hookErrors.afterTrack) {
      throw new Error(this.hookErrors.afterTrack);
    }
    safePost(this.endpoint, {
      trackSeriesContext: hookContext,
      stage: 'afterTrack',
    });
  }
}

module.exports = { TestHook };
