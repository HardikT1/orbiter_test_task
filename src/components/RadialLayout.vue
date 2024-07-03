<template>
  <div class="radial-layout">
    <svg ref="svgRef"></svg>
    <div
      ref="tooltipRef"
      class="tooltip w-[500px] border border-[#B5B5B5] rounded flex flex-col"
      v-show="showTooltip"
      @mouseenter="hoverTooltip = true"
      @mouseleave="
        hoverTooltip = false;
        showTooltip = false;
      "
    >
      <div class="flex gap-[15px] px-[10px] py-[9px] justify-between">
        <img
          :src="tooltipData.member?.img"
          class="avatar w-[100px] h-[100px] rounded-full drop-shadow"
        />
        <div class="flex flex-col gap-[5px] text-xs font-normal text-white">
          <div class="font-bold text-base">{{ tooltipData.member?.name }}</div>
          <div>{{ tooltipData.member?.position }}</div>
          <div>{{ tooltipData.member?.city }}</div>
          <div class="flex gap-[6px] align-middle justify-between">
            <div class="flex align-middle">
              <div
                v-for="(member, index) in tooltipData?.otherMembers?.slice(
                  0,
                  3
                )"
                :key="index"
                class="flex align-middle min-w-4"
              >
                <img
                  :src="member.img"
                  alt="Avatar 1"
                  class="rounded-full border border-[#929292] h-5 w-5 -mr-2 my-auto"
                />
              </div>
            </div>
            <div class="text-wrap">
              {{ mutualConnections }}
            </div>
          </div>
        </div>
        <div>
          <div>
            <img src="../../public/companyAvatar.svg" />
          </div>
        </div>
      </div>

      <div class="p-[10px]">
        <div class="flex gap-[10px] flex-row p-[10px]">
          <img src="../assets/Vector.svg" />
          <div>Reply from Emery Wells</div>
        </div>
        <div class="flex flex-col gap-[10px] p-[10px]">
          <div
            class="text-sm font-normal text-[#929292] justify-between flex"
            v-if="tooltipData.member?.created_at"
          >
            <span class="">{{
              formateDate(tooltipData.member?.created_at)
            }}</span>
            <div>{{ relativeCreatedAt(tooltipData.member?.created_at) }}</div>
          </div>
          <div class="flex flex-col gap-[5px] text-white">
            <div class="font-bold text-base">
              {{ tooltipData.member?._orbits_last_message?.message_head }}
            </div>
            <transition name="slide-fade">
              <div
                class="font-light text-base"
                :class="{ truncate: !showMoreData }"
                v-if="!showMoreData"
              >
                {{ tooltipData.member?._orbits_last_message?.message }}
              </div>
              <div class="font-light text-base" v-else>
                {{ tooltipData.member?._orbits_last_message?.message }}
              </div>
            </transition>
          </div>
          <div
            v-if="!showMoreData"
            class="flex gap-[5px] align-middle w-20"
            @click="showMoreData = true"
          >
            <div class="font-light text-base">More</div>
            <div><img src="../../public/chevron-down.svg" /></div>
          </div>
          <div
            v-else
            class="flex gap-[5px] align-middle w-20"
            @click="showMoreData = false"
          >
            <div class="font-light text-base">Less</div>
            <div>
              <img class="rotate-180" src="../../public/chevron-down.svg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineProps, watch, computed } from "vue";
import * as d3 from "d3";
import { format, formatDistanceToNow } from "date-fns";
import { debounce } from "lodash";

const props = defineProps(["orbits"]);

const emit = defineEmits(["fetchMoreData"]);

const svgRef = ref(null);
const tooltipRef = ref(null);
const showTooltip = ref(false);
const hoverTooltip = ref(false);
const tooltipData = ref({});
const zoomLevel = ref(0);
const showMoreData = ref(false);

watch(tooltipData, (value) => {
  showMoreData.value = false;
});

const renderChart = () => {
  const svg = d3.select(svgRef.value);
  const width = window.innerWidth;
  const height = window.innerHeight;
  const centerX = width / 2;
  const centerY = height;

  svg.attr("width", width).attr("height", height);

  const g = svg
    .selectAll(".arc-group")
    .data([...new Set(props.orbits.map((orbit) => orbit.contact_date))])
    .join(
      (enter) =>
        enter
          .append("g")
          .attr("class", "arc-group")
          .attr("transform", `translate(${centerX},${centerY})`),
      (update) => update,
      (exit) => exit.remove()
    );

  const contactDates = [
    ...new Set(props.orbits.map((orbit) => orbit.contact_date)),
  ];

  const arcData = contactDates.map((date, index) => ({
    contact_date: date,
    radius: (index + 1) * (100 + zoomLevel.value),
    maxImages: (index + 1) * 5,
  }));

  g.each(function (date, index) {
    const arcDatum = arcData.find((arc) => arc.contact_date === date);
    const arcGroup = d3.select(this);

    arcGroup
      .selectAll("path")
      .data([arcDatum])
      .join(
        (enter) =>
          enter
            .append("path")
            .attr(
              "d",
              d3
                .arc()
                .innerRadius(0)
                .outerRadius(0)
                .startAngle(-Math.PI / 2)
                .endAngle(Math.PI / 2)
            )
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .attr("opacity", 0)
            .transition()
            .duration(1000)
            .attr("opacity", 1)
            .attr(
              "d",
              d3
                .arc()
                .innerRadius(arcDatum.radius)
                .outerRadius(arcDatum.radius)
                .startAngle(-Math.PI / 2)
                .endAngle(Math.PI / 2)
            ),
        (update) =>
          update
            .transition()
            .duration(1000)
            .attr(
              "d",
              d3
                .arc()
                .innerRadius(arcDatum.radius)
                .outerRadius(arcDatum.radius)
                .startAngle(-Math.PI / 2)
                .endAngle(Math.PI / 2)
            ),
        (exit) => exit.remove()
      );

    if (index === arcData.length - 1) {
      arcGroup
        .selectAll("text")
        .data([arcDatum])
        .join(
          (enter) =>
            enter
              .append("text")
              .attr("x", 0)
              .attr("y", 0)
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "middle")
              .attr("fill", "white")
              .style("font-size", "16px")
              .text("Today")
              .attr("opacity", 0)
              .transition()
              .duration(1000)
              .attr("opacity", 1)
              .attr("y", -arcDatum.radius),
          (update) =>
            update.attr("y", -arcDatum.radius).transition().duration(1000),
          (exit) => exit.remove()
        );
    }

    const orbitsForDate = props.orbits.filter(
      (orbit) => orbit.contact_date === arcDatum.contact_date
    );

    const totalImages = orbitsForDate.reduce(
      (acc, orbit) => acc + orbit.array.length,
      0
    );
    const angleScale = d3
      .scaleLinear()
      .domain([0, Math.min(totalImages, arcDatum.maxImages)])
      .range([-Math.PI, 0]);

    let imageIndex = 0;

    orbitsForDate.forEach((orbit) => {
      orbit.array.slice(0, arcDatum.maxImages).forEach((item, _, arrayItself) => {
        const angle = angleScale(imageIndex + 0.5);
        const x = arcDatum.radius * Math.cos(angle);
        const y = arcDatum.radius * Math.sin(angle);

        const node = arcGroup
          .selectAll(`.node-${item.id}`)
          .data([item])
          .join(
            (enter) =>
              enter
                .append("g")
                .attr("class", `node node-${item.id}`)
                .attr("transform", `translate(0,0)`)
                .attr("opacity", 0)
                .on("mouseover", function (event) {
                  showTooltip.value = true;
                  tooltipData.value = {
                    member: item,
                    otherMembers: arrayItself.map((member) => {
                      return {
                        name: member.name,
                        img: member.img,
                      };
                    }),
                  };
                  const [tooltipX, tooltipY] = [x + width / 2, y + height];
                  tooltipRef.value.style.left = `${tooltipX - 20}px`;
                  tooltipRef.value.style.top = `${tooltipY - 20}px`;
                })
                .on("mousemove", function (event) {
                  const [tooltipX, tooltipY] = [x + width / 2, y + height];
                  tooltipRef.value.style.left = `${tooltipX - 20}px`;
                  tooltipRef.value.style.top = `${tooltipY - 20}px`;
                })
                .on("mouseout", () => {
                  setTimeout(() => {
                    if (!hoverTooltip.value) {
                      showTooltip.value = false;
                    }
                  }, 300);
                })
                .transition()
                .duration(1000)
                .attr("opacity", 1)
                .attr("transform", `translate(${x},${y})`),
            (update) =>
              update
                .transition()
                .duration(1000)
                .attr("transform", `translate(${x},${y})`),
            (exit) => exit.remove()
          );

        node
          .append("circle")
          .attr("r", 20)
          .style("fill", "none")
          .style("stroke", "none");
        node
          .append("image")
          .attr("xlink:href", item.img)
          .attr("x", -20)
          .attr("y", -20)
          .attr("width", 40)
          .attr("height", 40)
          .attr("clip-path", "url(#clipCircle)");

        imageIndex++;
      });
    });
  });

  svg
    .append("defs")
    .append("clipPath")
    .attr("id", "clipCircle")
    .append("circle")
    .attr("r", 20)
    .attr("cx", 0)
    .attr("cy", 0);
};

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const formateDate = (date) => {
  return format(new Date(date), "EEEE, MMMM d yyyy 'at' h:mm aaaa OOOO", {
    timeZone,
  });
};

const relativeCreatedAt = (date) => {
  return formatDistanceToNow(date, { addSuffix: true });
};

const handleScroll = (event) => {
  const delta = event.deltaY;
  if (delta > 0) {
    zoomLevel.value += 10;
    emit("fetchMoreData");
  } else {
    zoomLevel.value = Math.max(0, zoomLevel.value - 10);
  }
};

const mutualConnections = computed(() => {
  if (tooltipData.value?.otherMembers) {
    const firstName = tooltipData.value?.otherMembers[0].name;
    const length = tooltipData.value?.otherMembers.length;
    return firstName + ", and " + (length - 1) + " other mutual connections";
  }
  return "";
});

const debouncedRenderChart = debounce(renderChart, 100);

watch([() => props.orbits, zoomLevel], debouncedRenderChart);

onMounted(() => {
  window.addEventListener("wheel", handleScroll);
  renderChart();
});

onUnmounted(() => {
  window.removeEventListener("wheel", handleScroll);
});
</script>

<style>
.radial-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: #000;
  position: relative;
}
svg {
  width: 100%;
  height: 100%;
}
.tooltip {
  position: absolute;
  background: rgb(0, 0, 0);
  color: white;
  border-radius: 5px;
  pointer-events: auto;
  z-index: 10;
  word-wrap: break-word;
}

.tooltip-content {
  display: flex;
  align-items: center;
}

.tooltip-content .avatar {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 10px;
}

.tooltip-details {
  flex: 1;
}

.message {
  margin-top: 10px;
}
.slide-fade-enter-active {
  transition: all 0.5s ease-in;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
