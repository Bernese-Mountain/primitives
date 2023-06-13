import type { ComponentPublicInstance, PropType, Ref } from 'vue'
import { useRef, computed, defineComponent, h, onMounted, onUnmounted, ref, toRefs, watch, watchEffect } from 'vue'
import type { ComponentPropsWithoutRef } from '@oku-ui/primitive'
import { Primitive } from '@oku-ui/primitive'
import type { Scope } from '@oku-ui/provide'
import { createProvideScope } from '@oku-ui/provide'
import { useCallbackRef } from '@oku-ui/use-callback-ref'
import { composeEventHandlers } from '@oku-ui/utils'
import type { ElementType, MergeProps, PrimitiveProps, RefElement } from '@oku-ui/primitive'
import { useControllableRef, usePrevious, useRef, useSize } from '@oku-ui/use-composable'

function defaultOnCheckedChange(checked: boolean) {
  return new Event('checkedchange', {
    //
  })
}
function getState(checked: boolean) {
  return checked ? 'checked' : 'unchecked'
}
/* -------------------------------------------------------------------------------------------------
 * BubbleInput
 * ----------------------------------------------------------------------------------------------- */
type BubbleInputElement = ElementType<'input'>

const BubbleInput = defineComponent({
  name: 'BubbleInput',
  inheritAttrs: false,
  props: {
    checked: {
      type: Boolean,
      default: false,
    },
    control: {
      type: Object as PropType<HTMLElement | null>,
      default: null,
    },
    bubbles: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { attrs }) {
    const { ...inputAttrs } = attrs as BubbleInputElement
    const { checked, control, bubbles } = props
    const _ref = ref<HTMLInputElement>()
    const prevChecked = usePrevious(checked)
    const controlSize = useSize(control)

    onMounted(() => {
      watchEffect(() => {
        let input = _ref.value!
        const inputProto = window.HTMLInputElement.prototype
        const descriptor = Object.getOwnPropertyDescriptor(inputProto, 'checked') as PropertyDescriptor
        const setChecked = descriptor.set

        if (prevChecked !== checked && setChecked) {
          const event = new Event('click', { bubbles })
          input = getState(checked)
          setChecked.call(input, getState(checked) ? false : checked)
          input.dispatchEvent(event)
        }
      })
    })

    return () =>
      h('input', {
        'type': 'checkbox',
        'aria-hidden': true,
        'defaultChecked': getState(checked) ? false : checked,
        ...inputAttrs,
        'tabIndex': -1,
        'ref': _ref,
        'style': {
          ...inputAttrs.style as any,
          ...controlSize,
          position: 'absolute',
          pointerEvents: 'none',
          opacity: 0,
          margin: 0,
        },
      })
  },
})
/* -------------------------------------------------------------------------------------------------
 * Switch
 * ----------------------------------------------------------------------------------------------- */

const SWITCH_NAME = 'Switch'
type ScopedProps<P> = P & { __scopeSwitch?: Scope }
const [createSwitchContext, createSwitchScope] = createProvideScope(SWITCH_NAME)

type SwitchContextValue = { checked: boolean; disabled?: boolean }
const [SwitchProvider, useSwitchContext] = createSwitchContext<SwitchContextValue>(SWITCH_NAME)

type SwitchElement = ComponentPropsWithoutRef<typeof Primitive.button>
type PrimitiveButtonProps = ComponentPropsWithoutRef<typeof Primitive.button>
interface SwitchProps extends PrimitiveButtonProps {
  checked?: boolean
  defaultChecked?: boolean
  required?: boolean
  onCheckedChange?(checked: boolean): void
}

const Switch = defineComponent({
  name: SWITCH_NAME,
  inheritAttrs: false,
  props: {
    name: {
      type: String,
      default: '',
    },
    checked: {
      type: Boolean,
      default: false,
    },
    defaultChecked: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    value: {
      type: String,
      default: 'on',
    },
    onCheckedChange: {
      type: Function as PropType<(checked: boolean) => Event>,
      default: defaultOnCheckedChange,
    },
  },
  setup(props, { attrs, slots, expose }) {
    const { name, checked, defaultChecked, required, disabled, value, onCheckedChange } = toRefs(props)
    const { __scopeSwitch, ...switchProps } = attrs as ScopedProps<SwitchProps>
    const { _ref: buttonRef, refEl: buttonRefEl } = useRef<HTMLButtonElement>()

    const innerRef = ref<ComponentPublicInstance>()

    SwitchProvider({
      //
    })

    expose({
      SwitchProps: computed(() => innerRef.value?.$el),
      innerRef: buttonRefEl,
    })
    const isFormControl = buttonRefEl.value ? Boolean(buttonRefEl.value.closest('form')) : true
    const hasConsumerStoppedPropagationRef = ref(false)
    const originalReturn = () =>
      [h(Primitive.button, {
        'type': 'button',
        'role': 'switch',
        'aria-checked': checked.value as any,
        'aria-required': required.value,
        'data-state': getState(checked.value as any),
        'data-disabled': disabled.value ? '' : undefined,
        'disabled': disabled,
        'value': value,
        ...switchProps,
        'ref': innerRef,
        'onKeyDown': composeEventHandlers(switchProps.onKeydown, (event: any) => {
          // According to WAI ARIA, Checkboxes don't activate on enter keypress
          if (event.key === 'Enter')
            event.preventDefault()
        }),
        'onClick': composeEventHandlers(switchProps.onClick, (event: any) => {
          checked.value = getState(checked.value as any) ? true : !(checked.value as any)
          if (isFormControl) {
            // hasConsumerStoppedPropagationRef.value.current = event.isPropagationStopped()
            // if checkbox is in a form, stop propagation from the button so that we only propagate
            // one click event (from the input). We propagate changes from an input so that native
            // form validation works and form events reflect checkbox updates.
            if (!hasConsumerStoppedPropagationRef.value)
              event.stopPropagation()
          }
        }),
      },
      {
        default: () => slots.default?.(),
      }),
      isFormControl && h(
        BubbleInput,
        {
          control: buttonRefEl.value,
          bubbles: !hasConsumerStoppedPropagationRef.value,
          name,
          value,
          checked: checked.value,
          required,
          disabled,
          // We transform because the input is absolutely positioned but we have
          // rendered it **after** the button. This pulls it back to sit on top
          // of the button.
          style: { transform: 'translateX(-100%)' },
        },
      ),
      ]
    return originalReturn as unknown as {
      innerRef: Ref<SwitchElement>
    }
  },
})

/* ----------------------------------------------------------------------------------------------- */

type _OkuCheckboxProps = MergeProps<SwitchProps, SwitchElement>


export {
 
}

export type {
  
}
