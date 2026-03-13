import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
    UpdateDateColumn,
} from 'typeorm';

import { SampleCandidate } from './sample-candidate.entity';

@Entity({ name: 'candidate_summaries' })
export class CandidateSummary {
    @PrimaryColumn({ type: 'varchar', length: 64 })
    id!: string;

    @Column({ name: 'candidate_id', type: 'varchar', length: 64 })
    candidateId!: string;

    @Column({ type: 'varchar', length: 50 })
    status!: string;

    @Column({ type: 'integer', nullable: true })
    score!: number | null;

    @Column({ type: 'text', nullable: true })
    strengths!: string | null;

    @Column({ type: 'text', nullable: true })
    concerns!: string | null;

    @Column({ type: 'text', nullable: true })
    summary!: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    decision!: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    provider!: string | null;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt!: Date;

    @ManyToOne(() => SampleCandidate, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'candidate_id' })
    candidate!: SampleCandidate;
}
