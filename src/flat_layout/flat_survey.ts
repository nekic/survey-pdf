import { IElement, IQuestion, PanelModelBase, PanelModel } from 'survey-core';
import { SurveyPDF } from '../survey';
import { IPoint, DocController } from '../doc_controller';
import { FlatRepository } from './flat_repository';
import { IFlatQuestion, FlatQuestion } from './flat_question';
import { IPdfBrick } from '../pdf_render/pdf_brick';
import { CompositeBrick } from '../pdf_render/pdf_composite';
import { RowlineBrick } from '../pdf_render/pdf_rowline';
import { SurveyHelper } from '../helper_survey';

export class FlatSurvey {
    public static readonly QUES_GAP_VERT_SCALE: number = 1.0;
    public static readonly PANEL_CONT_GAP_SCALE: number = 1.0;
    public static readonly PANEL_DESC_GAP_SCALE: number = 0.25;
    public static async generateFlatsPanel(controller: DocController,
        question: PanelModel, point: IPoint): Promise<IPdfBrick[]> {
        let panelFlats: IPdfBrick[] = [];
        let panelContentPoint: IPoint = SurveyHelper.clone(point);
        controller.pushMargins();
        controller.margins.left += controller.measureText(question.innerIndent).width;
        panelContentPoint.xLeft += controller.measureText(question.innerIndent).width;
        panelFlats.push(...await this.generateFlatsPagePanel(controller, question, panelContentPoint));
        controller.popMargins();
        return panelFlats;
    }
    private static async generateFlatsPagePanel(controller: DocController,
        pagePanel: PanelModelBase, point: IPoint, showPageTitles: boolean = true): Promise<IPdfBrick[]> {
        if (!pagePanel.isVisible) return;
        pagePanel.onFirstRendering();
        let pagePanelFlats: IPdfBrick[] = [];
        let currPoint: IPoint = SurveyHelper.clone(point);
        if (showPageTitles) {
            let compositeFlat: CompositeBrick = new CompositeBrick();
            if (pagePanel.title) {
                let pagelPanelTitleFlat: IPdfBrick = await SurveyHelper.createTitlePanelFlat(
                    currPoint, null, controller, pagePanel.locTitle);
                compositeFlat.addBrick(pagelPanelTitleFlat);
                currPoint = SurveyHelper.createPoint(pagelPanelTitleFlat);
            }
            if (pagePanel.description) {
                if (pagePanel.title) {
                    currPoint.yTop += controller.unitWidth * FlatSurvey.PANEL_DESC_GAP_SCALE;
                }
                let pagePanelDescFlat: IPdfBrick = await SurveyHelper.createDescFlat(
                    currPoint, null, controller, pagePanel.locDescription);
                compositeFlat.addBrick(pagePanelDescFlat);
                currPoint = SurveyHelper.createPoint(pagePanelDescFlat);
            }
            if (!compositeFlat.isEmpty) {
                pagePanelFlats.push(compositeFlat);
                currPoint.yTop += controller.unitHeight * FlatSurvey.PANEL_CONT_GAP_SCALE;
            }
        }
        for (let row of pagePanel.rows) {
            if (!row.visible) continue;
            controller.pushMargins();
            let width: number = SurveyHelper.getPageAvailableWidth(controller);
            let nextMarginLeft: number = controller.margins.left;
            let rowFlats: IPdfBrick[] = [];
            for (let i: number = 0; i < row.visibleElements.length; i++) {
                let element: IElement = row.visibleElements[i];
                if (!element.isVisible) continue;
                let persWidth: number = SurveyHelper.parseWidth(element.renderWidth,
                    width - (row.visibleElements.length - 1) * controller.unitWidth);
                controller.margins.left = nextMarginLeft + ((i !== 0) ? controller.unitWidth : 0);
                controller.margins.right = controller.paperWidth - controller.margins.left - persWidth;
                currPoint.xLeft = controller.margins.left;
                nextMarginLeft = controller.margins.left + persWidth;
                if (element instanceof PanelModel) {
                    rowFlats.push(...await this.generateFlatsPanel(controller, element, currPoint));
                }
                else {
                    let flatQuestion: IFlatQuestion =
                        FlatRepository.getInstance().create(<IQuestion>element, controller);
                    rowFlats.push(...await flatQuestion.generateFlats(currPoint));
                }
            }
            controller.popMargins();
            currPoint.xLeft = controller.margins.left;
            if (rowFlats.length !== 0) {
                currPoint.yTop = SurveyHelper.mergeRects(...rowFlats).yBot;
                currPoint.xLeft = point.xLeft;
                currPoint.yTop += controller.unitHeight * FlatSurvey.QUES_GAP_VERT_SCALE;
                pagePanelFlats.push(...rowFlats);
                pagePanelFlats.push(SurveyHelper.createRowlineFlat(currPoint, controller));
                currPoint.yTop += SurveyHelper.EPSILON;
            }
        }
        return pagePanelFlats;
    }
    private static popRowlines(flats: IPdfBrick[]) {
        while (flats.length > 0 && flats[flats.length - 1] instanceof RowlineBrick) {
            flats.pop();
        }
    }
    public static async generateFlats(survey: SurveyPDF): Promise<IPdfBrick[][]> {
        let flats: IPdfBrick[][] = [];
        for (let page of survey.visiblePages) {
            let pageFlats: IPdfBrick[] = [];
            pageFlats.push(...await this.generateFlatsPagePanel(survey.controller,
                page, survey.controller.leftTopPoint, survey.showPageTitles));
            flats.push(pageFlats);
            this.popRowlines(flats[flats.length - 1]);
        }
        return flats;
    }
}