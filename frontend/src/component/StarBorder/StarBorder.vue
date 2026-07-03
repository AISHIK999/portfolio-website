<template>
    <component
        :is="as"
        :class="[
            'relative inline-block overflow-hidden !bg-transparent !border-none !rounded-[20px]',
            customClass,
        ]"
        v-bind="restAttrs"
        :style="componentStyle"
    >
        <div class="relative z-10 text-text rounded-[20px]">
            <slot />
        </div>
    </component>
</template>

<script setup lang="ts">
import { computed, useAttrs } from "vue";

interface StarBorderProps {
    as?: string;
    customClass?: string;
    color?: string;
    speed?: string;
    thickness?: number;
}

const props = withDefaults(defineProps<StarBorderProps>(), {
    as: "button",
    customClass: "",
    color: "white",
    speed: "6s",
    thickness: 1,
});

const restAttrs = useAttrs();

const componentStyle = computed(() => {
    const base = {
        padding: `${props.thickness}px 0`,
    };
    const userStyle = (restAttrs.style as Record<string, string>) || {};
    return { ...base, ...userStyle };
});
</script>

<style scoped></style>
