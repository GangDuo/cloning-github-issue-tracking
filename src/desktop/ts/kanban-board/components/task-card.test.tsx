import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TaskCardContent } from './task-card';
import type { KanbanTask } from '../lib/kanban-data-mapper';

const task = (overrides: Partial<KanbanTask>): KanbanTask =>
  ({
    id: '1',
    name: 'ログイン画面の不具合修正',
    column: '未処理',
    priority: '高',
    displayOrder: undefined,
    assigneeName: '担当 太郎',
    parentName: undefined,
    type: 'バグ',
    category: '',
    milestoneId: undefined,
    searchText: '',
    record: {} as KanbanTask['record'],
    ...overrides,
  }) as KanbanTask;

describe('TaskCardContent', () => {
  it('件名・担当者名・優先度を表示する', () => {
    render(<TaskCardContent task={task({})} />);

    expect(screen.getByText('ログイン画面の不具合修正')).toBeInTheDocument();
    expect(screen.getByText('担当 太郎')).toBeInTheDocument();
    expect(screen.getByText('優先度: 高')).toBeInTheDocument();
  });

  it('親課題名がある場合は補助情報として表示する', () => {
    render(<TaskCardContent task={task({ parentName: '親課題A' })} />);

    expect(screen.getByText('親: 親課題A')).toBeInTheDocument();
  });

  it('親課題名がない場合は表示しない', () => {
    render(<TaskCardContent task={task({ parentName: undefined })} />);

    expect(screen.queryByText(/^親: /)).not.toBeInTheDocument();
  });

  it('担当者未設定の場合は「未割当」と表示する', () => {
    render(<TaskCardContent task={task({ assigneeName: '' })} />);

    expect(screen.getByText('未割当')).toBeInTheDocument();
  });
});
