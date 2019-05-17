import { IQuestion, QuestionTextModel } from 'survey-core';
import { IRect, DocController } from '../doc_controller';
import { TextBrick } from './pdf_text';

export class TitleBrick extends TextBrick {
    protected question: QuestionTextModel;
    constructor(question: IQuestion, controller: DocController,
        rect: IRect, text: string) {
        super(question, controller, rect, text);
    }
    async render() {
        this.controller.fontStyle = 'bold';
        super.render();
        this.controller.fontStyle = 'normal';
    }
}