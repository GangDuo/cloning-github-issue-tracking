import { describe, expect, it } from 'vitest';
import { selectLeafTasks } from './leaf-task-selector';
import { buildSavedSavedFields } from '../../../../../test/record-builders';

const record = (ticketNo: string, parent?: string) =>
  buildSavedSavedFields({
    チケットNo: { type: 'RECORD_NUMBER', value: ticketNo },
    ...(parent !== undefined
      ? { 親: { type: 'SINGLE_LINE_TEXT', value: parent } }
      : {}),
  });

describe('selectLeafTasks', () => {
  it('誰の親にもなっていないレコードのみを返す', () => {
    const parentTask = record('1');
    const childTask = record('2', '1');

    expect(selectLeafTasks([parentTask, childTask])).toEqual([childTask]);
  });

  it('3階層(親→子→孫)でも末端の孫だけを返す', () => {
    const grandParent = record('1');
    const parent = record('2', '1');
    const child = record('3', '2');

    expect(selectLeafTasks([grandParent, parent, child])).toEqual([child]);
  });

  it('親を持たないレコードのみの場合は全件を返す', () => {
    const taskA = record('1');
    const taskB = record('2');

    expect(selectLeafTasks([taskA, taskB])).toEqual([taskA, taskB]);
  });
});
