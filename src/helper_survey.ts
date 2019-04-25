import { LocalizableString, Question } from 'survey-core';
import { IPoint, IRect, DocController } from './doc_controller';

export class SurveyHelper {
    static DESCRIPTION_FONT_SIZE_SCALE_MAGIC: number = 2.0 / 3.0;
    static mergeRects(...rects: IRect[]): IRect {
        let resultRect: IRect = {
            xLeft: rects[0].xLeft,
            xRight: rects[0].xRight,
            yTop: rects[0].yTop,
            yBot: rects[0].yBot
        };
        rects.forEach((rect: IRect) => {
            resultRect.xLeft = Math.min(resultRect.xLeft, rect.xLeft),
                resultRect.xRight = Math.max(resultRect.xRight, rect.xRight),
                resultRect.yTop = Math.min(resultRect.yTop, rect.yTop),
                resultRect.yBot = Math.max(resultRect.yBot, rect.yBot)
        });
        return resultRect;
    }
    static createPoint(rect: IRect, isLeft: boolean = true, isTop: boolean = false): IPoint {
        return {
            xLeft: isLeft ? rect.xLeft : rect.xRight,
            yTop: isTop ? rect.yTop : rect.yBot
        };
    }
    static createRect(point: IPoint, width: number, height: number): IRect {
        return {
            xLeft: point.xLeft,
            xRight: point.xLeft + width,
            yTop: point.yTop,
            yBot: point.yTop + height
        };
    }
    static createTextRect(point: IPoint, controller: DocController, text: string): IRect {
        let { width, height } = controller.measureText(text);
        return SurveyHelper.createRect(point, width, height);
    }
    static createDescRect(point: IPoint, controller: DocController, text: string): IRect {
        let oldFontSize: number = controller.fontSize;
        controller.fontSize = oldFontSize * SurveyHelper.DESCRIPTION_FONT_SIZE_SCALE_MAGIC;
        let rect: IRect = SurveyHelper.createTextRect(point, controller, text);
        controller.fontSize = oldFontSize;
        return rect;
    }
    static createTextFieldRect(point: IPoint, controller: DocController, lines: number = 1): IRect {
        let width: number = controller.paperWidth - point.xLeft -
            controller.margins.marginRight;
        let height: number = controller.measureText().height * lines;
        return SurveyHelper.createRect(point, width, height);
    }
    static createAcroformRect(rect: IRect): Array<number> {
        return [
            rect.xLeft,
            rect.yTop,
            rect.xRight - rect.xLeft,
            rect.yBot - rect.yTop
        ];
    }
    static getTitleText(question: Question): string {
        let number: string = question.no != '' ? question.no + ' . ' : '';
        return number + SurveyHelper.getLocString(question.locTitle);
    }
    static getLocString(locObj: LocalizableString): string {
        return locObj.renderedHtml;
    }
}