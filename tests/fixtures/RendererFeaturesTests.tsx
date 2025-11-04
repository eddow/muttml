import { reactive } from 'mutts/src'
import { Scope } from '../../src/lib/index.ts'

const state = reactive({
	flag: true,
	alt: false,
	classOn: false,
	styleMode: 'obj' as 'obj' | 'arr' | 'str',
	inner: '<em>html</em>',
	listenerEnabled: true,
	clicks: 0,
	forLabel: 'lbl',
	attrVal: 'attr',
	// inputs
	textVal: 'hello',
	check: false,
	num: 5,
	range: 3,
	thisCaptured: false,
	topic: 'Alice',
})

const controls = {
	toggleFlag() { state.flag = !state.flag },
	toggleAlt() { state.alt = !state.alt },
	toggleClass() { state.classOn = !state.classOn },
	switchStyle(mode: 'obj' | 'arr' | 'str') { state.styleMode = mode },
	setInner(v: string) { state.inner = v },
	toggleListener() { state.listenerEnabled = !state.listenerEnabled },
	resetClicks() { state.clicks = 0 },
	setTopic(v: string) { state.topic = v },
}

declare global {
	interface Window {
		__rendererControls?: typeof controls
	}
}
window.__rendererControls = controls

function ReactiveClassDemo() {
	return (
		<div data-testid="class-demo">
			<div data-testid="class-static" class="a b" />
			<div data-testid="class-reactive" class={state.classOn ? 'x y' : 'x'} />
		</div>
	)
}

function StyleDemo() {
	const styleFn = () => {
		if (state.styleMode === 'obj') return { color: 'red', padding: '4px' }
		if (state.styleMode === 'arr') return [{ color: 'blue' }, false, { marginTop: '2px' }]
		return 'background-color: green; border: 1px solid black'
	}
	return (
		<div data-testid="style-demo">
			<div data-testid="style-reactive" style={styleFn()} />
		</div>
	)
}

function InnerHtmlDemo() {
	return (
		<div data-testid="inner-demo">
			{h('div', { 'data-testid': 'inner', innerHTML: state.inner as any })}
		</div>
	)
}

function Box() {
    return <div data-testid="use-inline-comp-child">C</div>
}

function UseCallbackDemo(_: any, scope: any) {
    return (
        <section data-testid="use-inline-demo">
            <div
                data-testid="use-inline-el"
                use={(target: any) => {
                    if (target instanceof HTMLElement) target.setAttribute('data-inline', 'yes')
                }}
            />

            <Box
                use={(target: any) => {
                    const first = Array.isArray(target) ? target[0] : target
                    if (first instanceof HTMLElement) (first as HTMLElement).setAttribute('data-comp', 'yes')
                }}
            />
        </section>
    )
}

function EventsDemo() {
	const handler = () => { state.clicks++ }
	return (
		<div data-testid="events-demo">
			<button
				data-testid="evt-btn"
				onClick={state.listenerEnabled ? handler : undefined}
			>
				Click
			</button>
			<span data-testid="clicks">{state.clicks}</span>
		</div>
	)
}

function PropVsAttrDemo() {
	return (
		<div data-testid="propattr-demo">
			<label data-testid="label" htmlFor={state.forLabel}>Lbl</label>
			<div data-testid="div-propattr" id={state.attrVal} data-x={state.attrVal} />
		</div>
	)
}

function InputsDemo() {
	let capturedInputMount: any
	return (
		<div data-testid="inputs-demo">
			<input data-testid="text" value={state.textVal} />
			<input data-testid="checkbox" type="checkbox" checked={state.check} />
			<input data-testid="number" type="number" value={state.num} />
			<input data-testid="range" type="range" value={state.range} />
			<input data-testid="default-type" this={capturedInputMount} />
		</div>
	)
}

function RendererConditionsDemo(_: any, scope: any) {
    scope.user = (v?: any) => (v === 'ok') === state.flag
    return (
        <div data-testid="cond-demo">
            <div when:user="ok" data-testid="when-shown">Shown</div>
            <div when:user="not" data-testid="when-hidden">Hidden</div>
        </div>
    )
}

function ThisAndUseDemo(_: any, scope: any) {
    scope.attach = () => {
        // mark captured as soon as use:attach runs
        state.thisCaptured = true
        return () => {}
    }
	let captured: any
	return (
		<div data-testid="this-use">
			<div data-testid="this-target" this={captured} use:attach={{ get: () => (state.alt ? 'x' : 'y'), set: () => {} }}>T</div>
			<span data-testid="this-state">{String(state.thisCaptured)}</span>
		</div>
	)
}

function AComponent(props: { children?: JSX.Children }, scope: Record<PropertyKey, any>) {
	scope.myValue = 52
	return <div data-testid="scope-component">{props.children}</div>
}

function BComponent(_: any, scope: Record<PropertyKey, any>) {
	return <p class="my-value">My value is {scope.myValue}</p>
}

const RendererFeaturesFixture = (_: any, scope: Record<PropertyKey, any>) => {
	scope.myValue = 32
	return (
		<main>
			<h1>Renderer Features Fixture</h1>
			<section class="controls">
				<button data-action="toggle-flag" onClick={controls.toggleFlag}>Toggle Flag</button>
				<button data-action="toggle-alt" onClick={controls.toggleAlt}>Toggle Alt</button>
				<button data-action="toggle-class" onClick={controls.toggleClass}>Toggle Class</button>
				<button data-action="style-obj" onClick={() => controls.switchStyle('obj')}>Style Obj</button>
				<button data-action="style-arr" onClick={() => controls.switchStyle('arr')}>Style Arr</button>
				<button data-action="style-str" onClick={() => controls.switchStyle('str')}>Style Str</button>
				<button data-action="toggle-listener" onClick={controls.toggleListener}>Toggle Listener</button>
				<button data-action="reset-clicks" onClick={controls.resetClicks}>Reset Clicks</button>
				<button data-action="topic-alice" onClick={() => controls.setTopic('Alice')}>Topic: Alice</button>
				<button data-action="topic-bob" onClick={() => controls.setTopic('Bob')}>Topic: Bob</button>
				<button data-action="topic-carol" onClick={() => controls.setTopic('Carol')}>Topic: Carol</button>
			</section>
			<section class="output">
				<ReactiveClassDemo />
				<StyleDemo />
				<InnerHtmlDemo />
				<EventsDemo />
				<PropVsAttrDemo />
				<InputsDemo />
                <UseCallbackDemo />
				<section data-testid="if-else-topic-demo">
					<Scope topic={state.topic}>
						<div if:topic="Alice" data-testid="branch-alice">Alice branch</div>
						<div if:topic="Bob" data-testid="branch-bob">Bob branch</div>
						<div else data-testid="branch-else">Else branch</div>
					</Scope>
				</section>
				<section data-testid="if-else-bool-demo">
					<div if={state.topic === 'Alice'} data-testid="branch-alice">Alice branch</div>
					<div if={state.topic === 'Bob'} data-testid="branch-bob">Bob branch</div>
					<div else data-testid="branch-else">Else branch</div>
				</section>
				<section data-testid="else-if-condition-demo">
					<div if={state.num > 10}>&gt;10</div>
					<div else if={state.num >= 5}>5-10</div>
					<div else>&lt;5</div>
				</section>
				<RendererConditionsDemo />
				<ThisAndUseDemo />
				<AComponent>
					<BComponent />
					<p class="direct-value">Direct value is {scope.myValue}</p>
				</AComponent>
			</section>
		</main>
	)}

export default RendererFeaturesFixture


