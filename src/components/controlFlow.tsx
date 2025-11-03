export function Scope(
	props: { children?: any; [key: string]: any },
	scope: Record<PropertyKey, any>
) {
	scope.is = true
	for (const [key, value] of Object.entries(props))
		if (key !== 'children')
			scope[key] = value
	return props.children
}
