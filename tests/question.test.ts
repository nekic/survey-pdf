(<any>window)['HTMLCanvasElement'].prototype.getContext = () => {
  return {};
};

import { PdfSurvey } from '../src/survey';
import { FlatTextbox } from '../src/flat_layout/flat_textbox';
import { FlatCheckbox } from '../src/flat_layout/flat_checkbox';
import { TestHelper } from '../src/helper_test';
import { SurveyHelper } from '../src/helper_survey';
import { Question } from 'survey-core';
let __dummy_tx = new FlatTextbox(null, null);
let __dummy_cb = new FlatCheckbox(null, null);

function checkTitleText(questionStartIndex: string, isRequired: boolean = false) {
  let json = {
    questions: [
      {
        name: 'textbox',
        type: 'text',
        title: 'Check my title',
        isRequired: isRequired
      }
    ]
  };
  let survey: PdfSurvey = new PdfSurvey(json, TestHelper.defaultOptions);
  if (questionStartIndex !== null) {
    survey.questionStartIndex = questionStartIndex;
  }
  survey.render();
  let internalContent = survey.controller.doc.internal.pages[1][2];
	expect(internalContent).toBeDefined();
  let regex = /\((.*)\)/;
  let content = internalContent.match(regex)[1];
  expect(content).toBe(SurveyHelper.getTitleText(<Question>survey.getAllQuestions()[0]));
}
test('Check title number', () => {
  checkTitleText(null);
});
test('Check title number with custom questionStartIndex', () => {
  checkTitleText('7');
});
test('Check title number with alphabetical questionStartIndex', () => {
  checkTitleText('A');
});
test('Check title required text', () => {
  checkTitleText(null, true);
});
test('Check comment', () => {
  let json = {
    questions: [
      {
        name: 'checkbox',
        type: 'checkbox',
        hasComment: true,
        commentText: 'comment check'
      }
    ]
  };
  let survey: PdfSurvey = new PdfSurvey(json, TestHelper.defaultOptions);
  survey.render();
  let internalContent = survey.controller.doc.internal.pages[1][3];
	expect(internalContent).toBeDefined();
  let regex = /\((.*)\)/;
  let content = internalContent.match(regex)[1];
  expect(content).toBe(json.questions[0].commentText);
});
