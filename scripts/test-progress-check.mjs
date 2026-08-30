import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const checkHtmlPath = path.join(root, 'check', 'index.html');

const VALID_RESULTS = new Set([
  'Klares Ziel',
  'Sichtbarer Fortschritt',
  'Tägliche Auswertung',
  'Ziel zuerst festlegen',
  'Starke Grundlage',
]);

const TITLE_BY_LEAK = {
  goal: 'Klares Ziel',
  proof: 'Sichtbarer Fortschritt',
  feedback: 'Tägliche Auswertung',
};

function highestLeak(values) {
  const tieOrder = ['proof', 'feedback', 'goal'];
  let highest = tieOrder[0];
  tieOrder.forEach((key) => {
    if (values[key] > values[highest]) {
      highest = key;
    } else if (values[key] === values[highest] && tieOrder.indexOf(key) < tieOrder.indexOf(highest)) {
      highest = key;
    }
  });
  return highest;
}

function referenceResult(answerValues) {
  const scores = answerValues;
  const normalized = {
    goal: (scores[0] + scores[1]) / 6,
    proof: (scores[2] + scores[3]) / 6,
    feedback: (scores[4] + scores[5] + scores[6]) / 9,
  };

  if (answerValues[0] === 3) {
    return {
      title: 'Ziel zuerst festlegen',
      normalized,
      branch: 'no_goal',
    };
  }

  const stable = normalized.goal <= 0.33 && normalized.proof <= 0.33 && normalized.feedback <= 0.33;
  if (stable) {
    return {
      title: 'Starke Grundlage',
      normalized,
      branch: 'stable',
    };
  }

  const primary = highestLeak(normalized);
  return {
    title: TITLE_BY_LEAK[primary],
    normalized,
    branch: primary,
  };
}

function loadProductionLogic(options = {}) {
  const harness = createHarness(options);
  const html = fs.readFileSync(checkHtmlPath, 'utf8');
  const scriptMatch = html.match(/<script>\s*\(function initProgressCheck\(\) \{([\s\S]*?)\}\)\(\);\s*<\/script>/);
  if (!scriptMatch) {
    throw new Error('Could not extract initProgressCheck script from check/index.html');
  }

  const wrapped = `
    (function initProgressCheck() {
      ${scriptMatch[1]}
      return {
        questions,
        highestLeak,
        makeResult,
        isWhatsAppReady,
        showResult,
        restartCheck,
        getState: function () { return state; },
        setAnswers: function (answers) { state.answers = answers.slice(); },
        setIndex: function (index) { state.index = index; },
        setCompleted: function (value) { state.completed = value; },
        renderQuestion,
        buildUrl,
      };
    })();
  `;

  const logic = vm.runInNewContext(wrapped, harness.sandbox, { filename: 'check-logic.vm.js' });
  return { logic, harness };
}

function createHarness(options = {}) {
  const initialSearch = typeof options === 'string'
    ? options
    : (options.search || '?src=test&creator=qa&utm_source=x&utm_medium=y&utm_campaign=z');
  const whatsappEnabled = typeof options === 'object' && options.whatsappEnabled === true;
  const whatsappNumber = typeof options === 'object' && options.whatsappNumber
    ? String(options.whatsappNumber)
    : '';
  const elements = new Map();

  function makeElement(id, tag = 'div') {
    const el = {
      id,
      tagName: tag.toUpperCase(),
      hidden: false,
      disabled: false,
      textContent: '',
      innerHTML: '',
      className: '',
      children: [],
      attributes: {},
      listeners: {},
      onclick: null,
      classList: {
        _values: new Set(),
        add(...names) {
          names.forEach((name) => this._values.add(name));
        },
        remove(...names) {
          names.forEach((name) => this._values.delete(name));
        },
        contains(name) {
          return this._values.has(name);
        },
      },
      setAttribute(name, value) {
        this.attributes[name] = String(value);
      },
      getAttribute(name) {
        return this.attributes[name];
      },
      removeAttribute(name) {
        delete this.attributes[name];
      },
      addEventListener(type, handler) {
        this.listeners[type] = handler;
      },
      click() {
        if (typeof this.onclick === 'function') this.onclick();
        if (typeof this.listeners.click === 'function') this.listeners.click();
      },
      appendChild(child) {
        this.children.push(child);
        return child;
      },
    };
    if (id) elements.set(id, el);
    return el;
  }

  const shell = makeElement('check-shell');
  const required = [
    ['screen-start', 'div'],
    ['screen-question', 'div'],
    ['screen-result', 'div'],
    ['progress-line', 'p'],
    ['question-title', 'h2'],
    ['answers', 'div'],
    ['error-note', 'p'],
    ['back-btn', 'button'],
    ['next-btn', 'button'],
    ['result-kicker', 'p'],
    ['result-title', 'h2'],
    ['result-explanation', 'p'],
    ['result-reason', 'p'],
    ['result-step', 'div'],
    ['result-next', 'p'],
    ['result-whatsapp', 'a'],
    ['result-product', 'a'],
    ['result-restart', 'button'],
    ['start-check', 'button'],
  ];

  required.forEach(([id, tag]) => makeElement(id, tag));

  const document = {
    getElementById(id) {
      return elements.get(id) || null;
    },
    querySelector(selector) {
      if (selector === '.check-shell') return shell;
      return null;
    },
    createElement(tag) {
      return makeElement(null, tag);
    },
  };

  const sandbox = {
    document,
    window: {
      location: new URL(`http://localhost/check${initialSearch}`),
      ASAS_CONFIG: {
        whatsappEnabled,
        whatsappNumber,
      },
      va() {},
    },
    console,
    URL,
    URLSearchParams,
    Array,
    String,
    Math,
    Object,
    Set,
    Map,
    Error,
  };

  sandbox.window.window = sandbox.window;
  sandbox.window.document = document;

  return { sandbox, elements, shell };
}

function runExhaustiveLogicTest(logic) {
  const counts = {
    'Klares Ziel': 0,
    'Sichtbarer Fortschritt': 0,
    'Tägliche Auswertung': 0,
    'Ziel zuerst festlegen': 0,
    'Starke Grundlage': 0,
  };

  const failures = [];
  let total = 0;

  for (let a0 = 0; a0 < 4; a0 += 1) {
    for (let a1 = 0; a1 < 4; a1 += 1) {
      for (let a2 = 0; a2 < 4; a2 += 1) {
        for (let a3 = 0; a3 < 4; a3 += 1) {
          for (let a4 = 0; a4 < 4; a4 += 1) {
            for (let a5 = 0; a5 < 4; a5 += 1) {
              for (let a6 = 0; a6 < 4; a6 += 1) {
                total += 1;
                const combo = [a0, a1, a2, a3, a4, a5, a6];
                const expected = referenceResult(combo);

                logic.setAnswers(combo);
                logic.setIndex(6);
                const result = logic.makeResult();

                const title = result && result.title;
                const resultName = result && result.resultName;

                if (!title || !resultName) {
                  failures.push({ combo, reason: 'missing title/resultName', result });
                  continue;
                }

                if (title !== resultName) {
                  failures.push({ combo, reason: 'title !== resultName', title, resultName });
                }

                if (!VALID_RESULTS.has(title)) {
                  failures.push({ combo, reason: 'invalid visible result', title });
                }

                if (title !== expected.title) {
                  failures.push({ combo, reason: 'title mismatch', got: title, expected: expected.title });
                }

                const scores = combo.map((answerIndex, idx) => logic.questions[idx].answers[answerIndex].points);
                const normalized = {
                  goal: (scores[0] + scores[1]) / 6,
                  proof: (scores[2] + scores[3]) / 6,
                  feedback: (scores[4] + scores[5] + scores[6]) / 9,
                };

                if ([normalized.goal, normalized.proof, normalized.feedback].some((value) => Number.isNaN(value))) {
                  failures.push({ combo, reason: 'NaN in normalized values', normalized });
                }

                if (combo[0] === 3 && title !== 'Ziel zuerst festlegen') {
                  failures.push({ combo, reason: 'q1=3 must force no_goal', title });
                }

                if (combo[0] !== 3) {
                  const stable = normalized.goal <= 0.33 && normalized.proof <= 0.33 && normalized.feedback <= 0.33;
                  if (stable && title !== 'Starke Grundlage') {
                    failures.push({ combo, reason: 'stable rule mismatch', title, normalized });
                  }
                  if (!stable && title === 'Starke Grundlage') {
                    failures.push({ combo, reason: 'stable shown without rule', normalized });
                  }
                }

                if (
                  expected.normalized.goal !== normalized.goal ||
                  expected.normalized.proof !== normalized.proof ||
                  expected.normalized.feedback !== normalized.feedback
                ) {
                  failures.push({ combo, reason: 'normalized formula mismatch', got: normalized, expected: expected.normalized });
                }

                if (combo[0] !== 3 && title !== 'Starke Grundlage') {
                  const primary = highestLeak(normalized);
                  if (TITLE_BY_LEAK[primary] !== title) {
                    failures.push({ combo, reason: 'highest leak mismatch', got: title, expected: TITLE_BY_LEAK[primary], normalized });
                  }
                }

                counts[title] += 1;
              }
            }
          }
        }
      }
    }
  }

  return { total, counts, failures };
}

function clickById(harness, id) {
  const el = harness.elements.get(id);
  if (!el || typeof el.listeners.click !== 'function') {
    throw new Error(`Missing click handler on #${id}`);
  }
  el.listeners.click();
}

function selectAnswer(harness, answerIndex) {
  const answers = harness.elements.get('answers');
  const button = answers.children.find((child) => child.attributes['data-answer-index'] === String(answerIndex));
  if (!button || typeof button.listeners.click !== 'function') {
    throw new Error(`Could not select answer index ${answerIndex}`);
  }
  button.listeners.click();
}

function runUiScenario(logic, harness, name, answers) {
  const errors = [];
  let resultTitle = '';

  try {
    logic.restartCheck();
    clickById(harness, 'start-check');

    if (harness.elements.get('screen-start').hidden !== true) errors.push('start screen not hidden');
    if (harness.elements.get('screen-question').hidden !== false) errors.push('question screen not visible');
    if (!harness.shell.classList.contains('is-running')) errors.push('running class missing');

    for (let i = 0; i < answers.length; i += 1) {
      const progress = harness.elements.get('progress-line').textContent;
      if (progress !== `Frage ${i + 1} von 7`) {
        errors.push(`progress mismatch at q${i + 1}: ${progress}`);
      }

      selectAnswer(harness, answers[i]);

      const state = logic.getState();
      if (state.answers[i] !== answers[i]) {
        errors.push(`answer not stored at q${i + 1}`);
      }

      if (i > 0) {
        clickById(harness, 'back-btn');
        if (logic.getState().index !== i - 1) errors.push(`back navigation failed at q${i + 1}`);
        if (logic.getState().answers[i - 1] !== answers[i - 1]) errors.push(`answer lost after back at q${i}`);
        clickById(harness, 'next-btn');
        if (logic.getState().index !== i) errors.push(`forward after back failed at q${i + 1}`);
        if (logic.getState().answers[i - 1] !== answers[i - 1]) errors.push(`answer lost after forward at q${i}`);
      }

      if (i < answers.length - 1) {
        clickById(harness, 'next-btn');
      }
    }

    clickById(harness, 'next-btn');

    if (harness.elements.get('screen-result').hidden !== false) errors.push('result screen not visible');
    const title = harness.elements.get('result-title').textContent;
    if (!VALID_RESULTS.has(title)) errors.push(`invalid result title: ${title}`);

    const wa = harness.elements.get('result-whatsapp');
    if (!wa.hidden) errors.push('whatsapp button should stay hidden without valid number');

    const product = harness.elements.get('result-product');
    const productHref = product.getAttribute('href') || '';
    if (!productHref.includes('angebot')) {
      errors.push(`product href invalid: ${productHref}`);
    }
    if (!productHref.includes('src=test')) errors.push('src param missing on product link');
    if (!productHref.includes('utm_campaign=z')) errors.push('utm_campaign param missing on product link');

    resultTitle = title;

    clickById(harness, 'result-restart');

    const resetState = logic.getState();
    if (resetState.answers.some((value) => value !== null)) errors.push('restart did not clear answers');
    if (resetState.completed !== false) errors.push('restart did not clear completed');
    if (harness.elements.get('screen-start').hidden !== false) errors.push('start screen not restored');
    if (harness.shell.classList.contains('is-running')) errors.push('running class not removed');
  } catch (error) {
    errors.push(error.message);
  }

  return { name, title: resultTitle || '', errors };
}

function main() {
  const { logic } = loadProductionLogic();
  const exhaustive = runExhaustiveLogicTest(logic);

  const uiCases = [
    { name: 'Starke Grundlage', answers: [0, 0, 0, 0, 0, 0, 0], expected: 'Starke Grundlage' },
    { name: 'Ziel zuerst festlegen', answers: [3, 0, 0, 0, 0, 0, 0], expected: 'Ziel zuerst festlegen' },
    { name: 'Klares Ziel', answers: [2, 3, 0, 0, 0, 0, 0], expected: 'Klares Ziel' },
    { name: 'Sichtbarer Fortschritt', answers: [0, 0, 3, 3, 0, 0, 0], expected: 'Sichtbarer Fortschritt' },
    { name: 'Tägliche Auswertung', answers: [0, 0, 0, 0, 3, 3, 3], expected: 'Tägliche Auswertung' },
  ];

  const uiResults = uiCases.map((testCase) => {
    const { logic: caseLogic, harness } = loadProductionLogic();
    const result = runUiScenario(caseLogic, harness, testCase.name, testCase.answers);
    if (result.title !== testCase.expected) {
      result.errors.push(`scenario expected ${testCase.expected}, got ${result.title}`);
    }
    return result;
  });

  const whatsappCases = uiCases.map((testCase) => {
    const { logic: caseLogic, harness } = loadProductionLogic({
      search: '?src=test',
      whatsappEnabled: true,
      whatsappNumber: '4915905463277',
    });
    const errors = [];
    let href = '';
    try {
      caseLogic.setAnswers(testCase.answers);
      caseLogic.setIndex(testCase.answers.length - 1);
      caseLogic.setCompleted(true);
      const result = caseLogic.makeResult(testCase.answers);
      caseLogic.showResult(result);
      const wa = harness.elements.get('result-whatsapp');
      if (wa.hidden) errors.push('whatsapp button hidden despite valid config');
      href = wa.getAttribute('href') || '';
      if (!href.startsWith('https://wa.me/4915905463277?text=')) {
        errors.push(`whatsapp href missing number: ${href}`);
      }
      const textParam = new URL(href).searchParams.get('text') || '';
      const expectedText = `Hi, ich habe den 7-Minuten-Check gemacht. Mein Ergebnis: ${testCase.expected}. Kommt ASAS für mich infrage?`;
      if (textParam !== expectedText) {
        errors.push(`whatsapp text mismatch: ${JSON.stringify(textParam)}`);
      }
    } catch (error) {
      errors.push(error.message);
    }
    return { name: `whatsapp:${testCase.name}`, href, errors };
  });

  const report = {
    exhaustivePassed: exhaustive.failures.length === 0,
    totalCombinations: exhaustive.total,
    resultCounts: exhaustive.counts,
    exhaustiveFailures: exhaustive.failures.slice(0, 20),
    exhaustiveFailureCount: exhaustive.failures.length,
    uiResults,
    uiPassed: uiResults.every((result) => result.errors.length === 0),
    whatsappResults: whatsappCases,
    whatsappPassed: whatsappCases.every((result) => result.errors.length === 0),
  };

  console.log(JSON.stringify(report, null, 2));

  if (!report.exhaustivePassed || !report.uiPassed || !report.whatsappPassed) {
    process.exitCode = 1;
  }
}

main();
