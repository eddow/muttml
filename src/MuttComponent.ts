import { ReactiveBase } from 'mutts'

export default abstract class MuttComponent extends ReactiveBase {
	static style?: string
	public abstract get template(): any
	public get style(): string | undefined {
		return undefined
	}
}
