import { useEffect, useState } from "react";
import { Box, Button, Grid2, TextField, Typography } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { styles } from "./ProfileUpdate.styles";
import {
  getUserByToken,
  updateProfile,
  uploadUserImage,
} from "../../services/Auth";
import login from "../../assets/LoginScreen.svg";
import { useSnackbar } from "../../hook";
import {
  ProfileResponse,
  User,
  UserResponse,
} from "../../services/Auth/Auth.types";
import { useSelector } from "react-redux";
import { RootState } from "../../store/Store";

const ProfileUpdate = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(""); // image preview
  const userId = useSelector((state: RootState) => state.auth.userId);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    try {
      if (token) {
        const response: UserResponse = await getUserByToken();
        setUserData(response.data);
      }
    } catch (error) {
      showSnackbar("Error fetching user data", "error");
    }
  };

  // Update form values and image preview when userData is available
  useEffect(() => {
    if (userData) {
      setImagePreview(userData.user_image || "");
      formik.setFieldValue("username", userData.username || "");
      formik.setFieldValue("email", userData.email || "");
      formik.setFieldValue("contact_number", userData.contact_number || "");
      formik.setFieldValue("address", userData.address || "");
    }
  }, [userData]);

  const formik = useFormik({
    enableReinitialize: true, // Reinitialize Formik when userData changes
    initialValues: {
      user_image: imagePreview || "",
      username: userData?.username || "",
      email: userData?.email || "",
      contact_number: userData?.contact_number || "",
      address: userData?.address || "",
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .matches(/^[a-zA-Z0-9.\-_$@*!]{3,20}$/, "Must be a valid username")
        .required("Username is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required")
        .matches(
          /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
          "Invalid email format"
        ),
      contact_number: Yup.string()
        .matches(/^[0-9]+$/, "Must be a valid contact number")
        .length(10, "Contact Number must be of 10 digits")
        .required("Contact Number is required"),
      address: Yup.string()
        .required("Address is required")
        .min(5, "At least 5 characters required")
        .max(50, "Up to 50 characters allowed"),
    }),
    onSubmit: async (values, actions) => {
      try {
        const res: ProfileResponse = await updateProfile(userId!, values);
        if (res.statusCode === 200) {
          showSnackbar("Profile updated successfully.", "success");
        }
      } catch (error) {
        showSnackbar("Error updating profile", "error");
      }
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // first file selected
    if (file) {
      setImage(file);
      //preview of the selected image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl); // Update preview state with the new image
    }
  };

  const handleImageUpload = async () => {
    if (!image) {
      showSnackbar("Please select an image first", "error");
      return;
    }
    try {
      const res = await uploadUserImage(image);
      setImagePreview(res.image); // Update image preview after upload
      setUserData((prevUserData: any) => ({
        ...prevUserData,
        user_image: res.image, // Update userData directly
      }));
      showSnackbar("Image uploaded successfully!", "success");
    } catch (error) {
      showSnackbar("Failed to upload image.", "error");
    }
  };

  return (
    <Grid2 container size={12}>
      <Grid2 size={7} sx={styles.svgGrid}>
        <Box sx={styles.svgBox}>
          <img
            src={login}
            alt="profile"
            style={{
              width: 600,
              height: 600,
              objectFit: "contain",
            }}
          />
        </Box>
      </Grid2>
      <Grid2
        size={{ xs: 12, sm: 4 }}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Box sx={styles.container}>
          <Typography
            component="h1"
            variant="h5"
            align="center"
            sx={styles.heading}
          >
            Profile Update
          </Typography>
          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            noValidate
            sx={{ mt: 2 }}
          >
            <Grid2 container spacing={2} sx={{ justifyContent: "center" }}>
              <Grid2 size={10}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <input
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    style={{ display: "none" }}
                    id="profile-image-upload"
                  />
                  <img
                    src={imagePreview || "https://via.placeholder.com/150"}
                    alt="profile"
                    onClick={() =>
                      document.getElementById("profile-image-upload")?.click()
                    }
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: "50%",
                      objectFit: "cover",
                      cursor: "pointer",
                    }}
                  />
                  <Button
                    onClick={handleImageUpload}
                    size="small"
                    variant="contained"
                    color="primary"
                    sx={{ paddingX: "28px" }}
                  >
                    Upload
                  </Button>
                </Box>
              </Grid2>

              <Grid2 size={10}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  id="username"
                  autoComplete="off"
                  size="small"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.username && Boolean(formik.errors.username)
                  }
                  helperText={formik.touched.username && formik.errors.username}
                />
              </Grid2>
              <Grid2 size={10}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  id="email"
                  autoComplete="off"
                  size="small"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid2>
              <Grid2 size={10}>
                <TextField
                  fullWidth
                  label="Contact Number"
                  name="contact_number"
                  id="contact_number"
                  autoComplete="off"
                  size="small"
                  value={formik.values.contact_number}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.contact_number &&
                    Boolean(formik.errors.contact_number)
                  }
                  helperText={
                    formik.touched.contact_number &&
                    formik.errors.contact_number
                  }
                />
              </Grid2>
              <Grid2 size={10}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  id="address"
                  autoComplete="off"
                  size="small"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.address && Boolean(formik.errors.address)
                  }
                  helperText={formik.touched.address && formik.errors.address}
                />
              </Grid2>
              <Grid2 size={10}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={styles.button}
                >
                  Save Changes
                </Button>
              </Grid2>
            </Grid2>
          </Box>
        </Box>
      </Grid2>
    </Grid2>
  );
};

export default ProfileUpdate;