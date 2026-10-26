import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { vi, describe, it, expect, beforeEach} from 'vitest'
import { useRouter } from 'vue-router'
import Login from '../components/Login.vue'
import { useAuthStore } from '../stores/authStore.js'

vi.mock('vue-router', () => {
    const pushMock = vi.fn()
    return {
        useRouter: () => ({ push: pushMock }),
        useRoute: () => ({})
    }
})

describe('Login.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        setActivePinia(createPinia())
    })

    it('renderiza el formulario de login', () => {
        const wrapper = mount(Login)
        expect(wrapper.find('#email-login').exists()).toBe(true)
    })

    it('llama a authStore.login y redirige al dashboard', async () => {
        const authStore = useAuthStore()
        authStore.login = vi.fn().mockResolvedValue()

        const router = useRouter()
        const wrapper = mount(Login)

        await wrapper.find('#email-login').setValue('usuario@test.com')
        await wrapper.find('#password-login').setValue('clave123')

        await wrapper.find('form').trigger('submit.prevent')

        await flushPromises()

        expect(authStore.login).toHaveBeenCalledWith('usuario@test.com', 'clave123')
        expect(router.push).toHaveBeenCalledWith('/dashboard')
    })

    it('muestra error si el login falla', async () => {
        const authStore = useAuthStore()
        authStore.login = vi.fn().mockRejectedValue(new Error('Credenciales inválidas'))

        const wrapper = mount(Login)

        await wrapper.find('#email-login').setValue('usuario@test.com')
        await wrapper.find('#password-login').setValue('mal')
        await wrapper.find('form').trigger('submit.prevent')

        await flushPromises()

        const errorMsg = wrapper.find('.form-error')
        expect(errorMsg.exists()).toBe(true)
    })
})