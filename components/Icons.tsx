import React from 'react';
import Svg, { G, Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../constants/colors';

export type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function ChevronDownIcon({
  size = 14,
  color = colors.text,
  strokeWidth = 1.75,
}: IconProps) {
  return (
    <Svg width={size} height={size * (8 / 14)} viewBox="0 0 14 8">
      <Path
        d="M1 1 L7 7 L13 1"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function ChevronUpIcon({
  size = 14,
  color = colors.text,
  strokeWidth = 1.75,
}: IconProps) {
  return (
    <Svg width={size} height={size * (8 / 14)} viewBox="0 0 14 8">
      <Path
        d="M1 7 L7 1 L13 7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function InfoIcon({
  size = 16,
  color = colors.text,
  strokeWidth = 1.6,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="8.2" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="10" cy="6.2" r="1" fill={color} />
      <Path
        d="M10 9.2 V14.4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ChevronRightIcon({
  size = 14,
  color = colors.text,
  strokeWidth = 2,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18 L15 12 L9 6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChevronLeftIcon({
  size = 14,
  color = colors.text,
  strokeWidth = 2,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18 L9 12 L15 6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function EditIcon({
  size = 14,
  color = colors.text,
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 20h9 M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function FlagIcon({
  size = 16,
  color = colors.text,
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 22V4 M4 4c6 0 7 3 13 3v9c-6 0-7-3-13-3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function EyeOffIcon({
  size = 16,
  color = colors.text,
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 3l18 18 M10.6 6.1A10.4 10.4 0 0112 6c5 0 9 4 10 6-0.5 1-1.6 2.7-3.3 4.2 M6.3 7.6C4.1 9.1 2.6 11 2 12c1 2 5 6 10 6 1.7 0 3.3-.5 4.8-1.3 M9.9 9.9a3 3 0 004.2 4.2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ShareIcon({
  size = 14,
  color = colors.text,
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7 M16 6l-4-4-4 4 M12 2v13"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function LockIcon({
  size = 26,
  color = colors.text,
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 11h14v10H5z M8 11V7a4 4 0 018 0v4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function StarIcon({ size = 12, color = colors.text }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3 L14.6 9.3 L21.5 9.9 L16.3 14.4 L17.9 21 L12 17.3 L6.1 21 L7.7 14.4 L2.5 9.9 L9.4 9.3 Z"
        stroke={color}
        strokeWidth={1.4}
        strokeLinejoin="round"
        fill={color}
      />
    </Svg>
  );
}

export function MoreVerticalIcon({ size = 18, color = colors.text, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 6 H20"  stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M4 12 H20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M4 18 H20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

export function CoinIcon({ size = 13, color = colors.text }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9.5" fill={color} />
      <Circle cx="12" cy="12" r="6" stroke="rgba(0,0,0,0.32)" strokeWidth={1.3} fill="none" />
    </Svg>
  );
}

export function BellIcon({
  size = 22,
  color = colors.text,
  strokeWidth = 1.7,
  steel = false,
}: IconProps & { steel?: boolean }) {
  // Steel variant: solid bell filled with a vertical white→grey gradient
  // (same treatment as the focused navigation tab icons).
  if (steel) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Defs>
          <LinearGradient id="bellSteel" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#e8e8ec" />
            <Stop offset="0.42" stopColor="#ffffff" />
            <Stop offset="1" stopColor="#6c7080" />
          </LinearGradient>
        </Defs>
        <Path
          d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
          fill="url(#bellSteel)"
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.73 21a2 2 0 0 1-3.46 0"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Clean monochrome thumb icons for the stance vote.
// Outline (fill="none") when inactive, solid fill when the side is selected.
export function ThumbUpIcon({
  size = 24,
  color = colors.text,
  filled = false,
  strokeWidth = 1.6,
}: IconProps & { filled?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 2 7.59 8.41C7.21 8.79 7 9.3 7 9.83v7.84C7 18.95 8.05 20 9.34 20h8.11c.7 0 1.36-.37 1.72-.97l2.66-6.15z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// Ported from https://upload.wikimedia.org/wikipedia/commons/5/57/Learn_Icon_WHITE-01.svg (CC0)
export function LearnIcon({ size = 68, color = colors.text }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 220 220" fill="none">
      <Path
        d="M74.535,214.707c-2.053-3.689,1.93-12.987-3.846-13.834c-16.118-2.361-27.516-4.172-23.36-22.525c1.546-6.827-10.011,2.085-9.121-13.126c0.265-4.518-6.73-3.977-4.062-13.54c2.98-10.682-38.909,7.479,0.927-45.172C35.038,106.324,8.116,0.231,125.668,3.178c9.897,0.248,20.705,3.998,31.756,8.611c8.783,3.667,90.967,62.034,9.81,158.84c-2.517,3.001-0.565,20.098-1.023,20.649"
        stroke={color}
        strokeWidth={3}
        strokeMiterlimit={10}
      />
      <Path
        d="M107.077,88.037l-2.79,0.182c-0.423-1.191-0.984-2.327-1.654-3.38l1.879-2.047c-0.582-0.852-1.231-1.657-1.937-2.411l-2.44,1.359c-0.896-0.882-1.886-1.666-2.965-2.339l0.802-2.655c-0.897-0.509-1.836-0.961-2.812-1.333l-1.596,2.265c-1.18-0.408-2.418-0.685-3.693-0.833l-0.452-2.728c-0.51-0.037-1.026-0.059-1.55-0.059c-0.525,0-1.05,0.021-1.56,0.059l-0.452,2.728c-1.281,0.149-2.513,0.426-3.693,0.833l-1.602-2.265c-0.968,0.372-1.916,0.824-2.804,1.333l0.793,2.655c-1.078,0.674-2.069,1.458-2.965,2.339l-2.433-1.359c-0.707,0.753-1.362,1.559-1.945,2.411l1.879,2.047c-0.67,1.053-1.224,2.189-1.646,3.38l-2.79-0.182c-0.306,0.973-0.532,1.981-0.692,3.008l2.593,1.038c-0.065,0.616-0.103,1.242-0.103,1.876c0,0.634,0.037,1.261,0.103,1.876l-2.593,1.038c0.16,1.027,0.386,2.033,0.692,3.005l2.79-0.179c0.422,1.195,0.977,2.324,1.646,3.38l-1.879,2.043c0.583,0.853,1.238,1.657,1.945,2.411l2.433-1.358c0.896,0.877,1.887,1.667,2.965,2.339l-0.793,2.65c0.889,0.514,1.836,0.962,2.804,1.337l1.602-2.262c1.18,0.409,2.412,0.682,3.693,0.832l0.444,2.731c0.518,0.029,1.035,0.054,1.559,0.054c0.532,0,1.041-0.025,1.559-0.054l0.444-2.731c1.275-0.149,2.521-0.423,3.694-0.832l1.603,2.262c0.976-0.375,1.908-0.823,2.804-1.337l-0.794-2.65c1.079-0.671,2.069-1.461,2.965-2.339l2.433,1.358c0.706-0.753,1.362-1.558,1.944-2.411l-1.879-2.043c0.67-1.056,1.223-2.185,1.646-3.38l2.789,0.179c0.306-0.972,0.54-1.978,0.685-3.005l-2.585-1.038c0.066-0.615,0.102-1.242,0.102-1.876c0-0.634-0.036-1.26-0.102-1.876l2.585-1.038C107.616,90.019,107.382,89.01,107.077,88.037z M87.868,108.957c-8.378,0-15.167-6.715-15.167-14.998c0-8.282,6.789-15.001,15.167-15.001c8.369,0,15.158,6.72,15.158,15.001C103.026,102.242,96.237,108.957,87.868,108.957z"
        fill={color}
      />
      <Path
        d="M182.001,72.813l-6.197-2.077c-0.758-3.197-2.011-6.202-3.694-8.919l2.914-5.849c-2.004-2.634-4.355-4.994-6.992-6.99l-5.842,2.914c-2.725-1.675-5.728-2.942-8.932-3.693L151.19,42c-0.052-0.007-0.103-0.011-0.16-0.018c0.094-0.095,0.196-0.178,0.282-0.27c-0.151-0.63-0.312-1.249-0.509-1.857c-0.772,0.667-1.597,1.275-2.411,1.876c-0.29-0.015-0.583-0.019-0.865-0.029c-0.266-0.947-0.548-1.886-0.897-2.797c0.874-1.114,1.689-2.272,2.448-3.474c-0.263-0.547-0.54-1.086-0.825-1.614c-0.807,1.03-1.661,2.014-2.57,2.957c-0.518-1.06-1.1-2.087-1.749-3.069c0.628-1.29,1.174-2.608,1.655-3.956c-0.401-0.524-0.816-1.034-1.254-1.537c-0.574,1.166-1.209,2.302-1.894,3.409c-0.758-0.939-1.558-1.842-2.418-2.688c0.335-1.38,0.604-2.775,0.808-4.177c-0.452-0.383-0.912-0.753-1.377-1.104c-0.321,1.264-0.7,2.506-1.151,3.733c-0.902-0.76-1.864-1.464-2.862-2.108c0.043-1.421,0.014-2.848-0.088-4.276c-0.53-0.292-1.071-0.561-1.625-0.816c-0.036,1.304-0.138,2.607-0.32,3.904c-1.056-0.561-2.162-1.067-3.305-1.497c-0.249-1.398-0.57-2.786-0.962-4.156c-0.583-0.175-1.173-0.328-1.771-0.469c0.24,1.289,0.423,2.59,0.532,3.896c-1.173-0.334-2.374-0.597-3.599-0.782c-0.554-1.319-1.15-2.604-1.821-3.869c-0.583-0.043-1.166-0.065-1.755-0.076c0.517,1.212,0.962,2.447,1.347,3.696c-0.678-0.043-1.362-0.072-2.039-0.072c-0.533,0-1.063,0.018-1.588,0.05c-0.817-1.18-1.706-2.316-2.652-3.405c-0.583,0.077-1.173,0.171-1.749,0.276c0.75,1.083,1.443,2.197,2.061,3.352c-1.216,0.167-2.402,0.412-3.568,0.725c-1.042-0.984-2.143-1.909-3.292-2.783c-0.597,0.214-1.194,0.445-1.778,0.692c0.939,0.907,1.835,1.861,2.688,2.847c-1.115,0.412-2.199,0.897-3.248,1.436c-1.218-0.744-2.47-1.428-3.751-2.055c-0.504,0.31-0.991,0.63-1.472,0.965c1.122,0.681,2.2,1.421,3.242,2.219c-1.005,0.633-1.974,1.325-2.893,2.076c-1.346-0.481-2.717-0.893-4.101-1.235c-0.466,0.441-0.917,0.893-1.354,1.352c1.217,0.458,2.403,0.983,3.577,1.555c-0.867,0.838-1.676,1.73-2.425,2.67c-1.413-0.182-2.841-0.302-4.261-0.356c-0.343,0.495-0.663,1.001-0.976,1.515c1.282,0.182,2.564,0.444,3.832,0.758c-0.657,0.969-1.247,1.985-1.778,3.037c-1.428,0.109-2.841,0.299-4.254,0.554c-0.227,0.542-0.436,1.092-0.626,1.639c1.303-0.087,2.6-0.11,3.911-0.059c-0.459,1.107-0.837,2.251-1.151,3.432c-1.368,0.426-2.723,0.924-4.05,1.493c-0.102,0.561-0.197,1.14-0.269,1.715c1.253-0.375,2.528-0.684,3.816-0.913c-0.211,1.201-0.349,2.436-0.408,3.689c-1.252,0.692-2.469,1.46-3.657,2.273c0.022,0.587,0.059,1.169,0.103,1.752c1.15-0.634,2.331-1.202,3.54-1.705c0.043,1.239,0.168,2.462,0.364,3.653c-1.092,0.917-2.135,1.89-3.125,2.914c0.154,0.601,0.307,1.191,0.488,1.781c1.005-0.82,2.047-1.588,3.132-2.31c0.292,1.141,0.649,2.251,1.071,3.336c-0.867,1.147-1.667,2.323-2.426,3.547c0.27,0.554,0.546,1.1,0.853,1.64c0.801-1.035,1.661-2.019,2.557-2.958c0.51,1.039,1.085,2.04,1.719,3.001c-0.612,1.297-1.159,2.623-1.639,3.974c0.401,0.513,0.809,1.009,1.231,1.504c0.561-1.188,1.18-2.345,1.85-3.46c0.766,0.962,1.573,1.873,2.448,2.725c-0.32,1.391-0.59,2.793-0.78,4.207c0.416,0.354,0.845,0.695,1.275,1.031c0.32-1.268,0.699-2.513,1.15-3.737c0.91,0.765,1.88,1.479,2.878,2.124c-0.029,1.438,0.021,2.881,0.146,4.316c0.531,0.287,1.071,0.558,1.616,0.816c0.036-1.305,0.146-2.608,0.321-3.912c1.042,0.557,2.134,1.056,3.264,1.485c0.073,0.375,0.189,0.74,0.276,1.111c-0.006,0.219-0.029,0.434-0.029,0.653c0,1.678,0.116,3.328,0.343,4.946l6.191,2.075c0.765,3.198,2.017,6.199,3.701,8.923l-2.915,5.842c1.996,2.637,4.355,4.994,6.994,6.997l5.842-2.917c2.723,1.683,5.726,2.939,8.924,3.694l2.074,6.199c1.618,0.222,3.265,0.338,4.945,0.338c1.676,0,3.322-0.116,4.948-0.338l2.067-6.199c3.204-0.755,6.207-2.011,8.925-3.694l5.842,2.917c2.636-2.003,4.995-4.36,6.992-6.997l-2.907-5.842c1.678-2.725,2.937-5.729,3.694-8.923l6.197-2.075c0.22-1.618,0.336-3.268,0.336-4.946C182.346,76.076,182.228,74.43,182.001,72.813z M148.269,53.186c1.006,0.083,1.996,0.207,2.972,0.404c-1.034,0.298-2.061,0.579-3.102,0.779C148.203,53.982,148.219,53.583,148.269,53.186z M100.062,49.306c0-11.036,8.945-19.973,19.981-19.973c10.075,0,18.385,7.474,19.746,17.177l-0.561,1.689c-3.204,0.758-6.206,2.019-8.929,3.697l-5.842-2.917c-2.639,2.003-4.998,4.356-6.994,6.993l2.915,5.849c-1.377,2.229-2.448,4.662-3.221,7.233C107.499,67.648,100.062,59.355,100.062,49.306z M139.418,54.063c-1.894,7.729-8.267,13.68-16.223,14.948C125.942,61.799,131.944,56.211,139.418,54.063z M146.242,102.431c-13.606,0-24.641-11.021-24.664-24.621c0.008,0,0.015,0,0.029,0c0.823,1.173,1.705,2.312,2.645,3.402c0.605-0.08,1.216-0.182,1.814-0.294c-0.745-1.083-1.42-2.2-2.047-3.343c1.193-0.172,2.359-0.413,3.495-0.719c1.042,0.988,2.135,1.917,3.272,2.791c0.589-0.208,1.172-0.43,1.749-0.677c-0.941-0.904-1.836-1.858-2.674-2.849c1.106-0.408,2.183-0.889,3.226-1.42c1.225,0.747,2.491,1.424,3.789,2.04c0.518-0.32,1.026-0.663,1.529-1.005c-1.106-0.685-2.177-1.435-3.211-2.236c1.012-0.633,1.988-1.333,2.913-2.09c1.333,0.488,2.682,0.911,4.06,1.271c0.45-0.425,0.887-0.87,1.316-1.325c-1.237-0.435-2.447-0.936-3.627-1.505c0.896-0.859,1.726-1.777,2.499-2.747c1.414,0.182,2.849,0.295,4.276,0.335c0.335-0.488,0.655-0.983,0.962-1.493c-1.297-0.182-2.572-0.43-3.839-0.739c0.677-1.008,1.288-2.065,1.836-3.165c1.426-0.131,2.848-0.335,4.268-0.605c0.197-0.488,0.386-0.987,0.56-1.49c-1.31,0.109-2.614,0.149-3.931,0.113c0.456-1.114,0.844-2.266,1.149-3.452c1.377-0.415,2.731-0.896,4.058-1.45c0.081-0.458,0.154-0.929,0.219-1.392c10.89,2.561,19.005,12.318,19.005,23.995C170.916,91.388,159.872,102.431,146.242,102.431z"
        fill={color}
      />
    </Svg>
  )
}

// Ported from https://upload.wikimedia.org/wikipedia/commons/c/c4/2-Dice-Icon.svg (CC0)
export function DiceIcon({ size = 68 }: { size?: number }) {
  const FACE = "M 71.459473,553.5 C 34.080566,553.5 3.5,522.91895 3.5,485.54004 L 3.5,71.459473 C 3.5,34.082031 34.080566,3.5 71.459473,3.5 L 485.54004,3.5 C 522.91797,3.5 553.5,34.082031 553.5,71.459473 L 553.5,485.54004 C 553.5,522.91895 522.91797,553.5 485.54004,553.5 L 71.459473,553.5 z"
  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024">
      {/* — Die 1 — */}
      <G transform="matrix(1.5,0,0,1.5,109.02942,-468.01519)">
        <Path
          d="M 245,341.5 C 252.5,329 270,314 282.5,314 L 557.5,469 C 562.5,474 575,506.5 565,519 L 292.5,679 C 285,681.5 252.5,679 242.5,654 L 245,341.5 z"
          fill="#404040" fillRule="evenodd"
        />
        <G transform="matrix(0.1910977,-0.3317217,0.1910977,0.3317217,152.64427,500.07482)">
          <Path d={FACE} fill="#ffffff" stroke="#000000" strokeWidth={7} />
          <Circle cx={278.5} cy={278.5} r={57.1} fill="#404040" />
        </G>
        <G transform="matrix(-0.3828283,0.000365,0.1917306,-0.3313563,472.998,680.25529)">
          <Path d={FACE} fill="#ffffff" stroke="#000000" strokeWidth={7} />
          <Circle cx={117.0} cy={440.0} r={57.1} fill="#404040" />
          <Circle cx={440.0} cy={440.0} r={57.1} fill="#404040" />
          <Circle cx={440.0} cy={117.0} r={57.1} fill="#404040" />
          <Circle cx={278.5} cy={278.5} r={57.1} fill="#404040" />
          <Circle cx={117.0} cy={117.0} r={57.1} fill="#404040" />
        </G>
        <G transform="matrix(0.1917306,0.3313563,-0.3828283,-0.000365,468.80258,313.31549)">
          <Path d={FACE} fill="#ffffff" stroke="#000000" strokeWidth={7} />
          <Circle cx={117.0} cy={440.0} r={57.1} fill="#404040" />
          <Circle cx={440.0} cy={440.0} r={57.1} fill="#404040" />
          <Circle cx={440.0} cy={117.0} r={57.1} fill="#404040" />
          <Circle cx={117.0} cy={117.0} r={57.1} fill="#404040" />
        </G>
      </G>

      {/* — Die 2 — */}
      <G transform="matrix(1.5,0,0,1.5,-774.05268,372.6114)">
        <G transform="matrix(0,1,-1,0,1481.1182,-519.93236)">
          <Path
            d="M 628.93236,528.61822 C 636.43236,516.11822 653.93236,501.11822 666.43236,501.11822 L 945.11486,661.94515 C 949.23133,668.60311 957.52152,683.02388 950.41128,703.51533 L 676.43236,866.11822 C 668.93236,868.61822 636.43236,866.11822 626.43236,841.11822 L 628.93236,528.61822 z"
            fill="#404040" fillRule="evenodd"
          />
          <G transform="matrix(0.1910977,-0.3317217,0.1910977,0.3317217,536.57663,687.19304)">
            <Path d={FACE} fill="#ffffff" stroke="#000000" strokeWidth={7} />
            <Circle cx={278.5} cy={278.5} r={57.1} fill="#404040" />
          </G>
          <G transform="matrix(-0.3828283,0.000365,0.1917306,-0.3313563,856.93036,867.37351)">
            <Path d={FACE} fill="#ffffff" stroke="#000000" strokeWidth={7} />
            <Circle cx={117.0} cy={440.0} r={57.1} fill="#404040" />
            <Circle cx={440.0} cy={117.0} r={57.1} fill="#404040" />
          </G>
          <G transform="matrix(0.1917306,0.3313563,-0.3828283,-0.000365,852.73494,500.43371)">
            <Path d={FACE} fill="#ffffff" stroke="#000000" strokeWidth={7} />
            <Circle cx={117.0} cy={440.0} r={57.1} fill="#404040" />
            <Circle cx={440.0} cy={117.0} r={57.1} fill="#404040" />
            <Circle cx={278.5} cy={278.5} r={57.1} fill="#404040" />
          </G>
        </G>
      </G>
    </Svg>
  )
}

export function ThumbDownIcon({
  size = 24,
  color = colors.text,
  filled = false,
  strokeWidth = 1.6,
}: IconProps & { filled?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 4h-2c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1h2V4zM2.17 11.12c-.11.25-.17.52-.17.8V13c0 1.1.9 2 2 2h5.5l-.92 4.65c-.05.22-.02.46.08.66.23.45.52.86.88 1.22L10 22l6.41-6.41c.38-.38.59-.89.59-1.42V6.34C17 5.05 15.95 4 14.66 4h-8.1c-.71 0-1.36.37-1.72.97l-2.67 6.15z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}