const MyComp1=(props: { someText: string } & JSX.BaseHTMLAttributes) => {
	return <div {...props}>{props.someText}</div>
}

const MyComp2=(props: { someText: string, slots: { div: JSX.BaseHTMLAttributes } }) => {
	return <div {...props.slots.div}>{props.someText}</div>
}

const t1 = <MyComp1 someText="Hello" class="some-class" />
const t2 = <MyComp2 someText="Hello">
	<slot:div class="some-class" />
	<slot:div class="some-other-class" />
	<slot:dav class="some-third-class" />
</MyComp2>